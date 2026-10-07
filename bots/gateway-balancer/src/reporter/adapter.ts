import { parseAbi, toFunctionSelector, zeroAddress } from "viem";
import type { ReporterRoute, Topology } from "../config/schema";
import type { Address, Hex, TxRequest } from "../domain";
import type { ChainClient, ChainClients, ReporterFunding, ReporterPreflight } from "../ports";

/** The value simulated by the preflight; the reporter's `receive()` must accept any positive amount. */
const PREFLIGHT_VALUE = 1n;

/**
 * PENDING (assumed signature): the CCIPReporter of `@kleros/veashi-sdk@0.1.0` exposes the token it pays CCIP fees
 * in; the zero address means native fees. Reporters without the function (LayerZero, DeBridge) revert the read.
 * Swap in the final fragment here once the SDK publishes its ABI.
 */
const FEE_TOKEN_ABI = parseAbi(["function feeToken() view returns (address)"]);
export const FEE_TOKEN_SELECTOR = toFunctionSelector("feeToken()").slice(2).toLowerCase();

const PUSH1 = 0x60;
const PUSH4 = 0x63;
const PUSH32 = 0x7f;
const DELEGATECALL = 0xf4;

/**
 * A preflight read failed (transport, node error, or a `feeToken()` that exists but could not be read): the route
 * is neither accepted nor refused this tick. The loop defers with a warning and retries next tick; it never
 * suspends on it and never funds on it.
 */
export class PreflightUnavailable extends Error {
  constructor(
    readonly routeId: string,
    detail: string
  ) {
    super(`preflight of route ${routeId} unavailable: ${detail}`);
    this.name = "PreflightUnavailable";
  }
}

/**
 * Whether runtime bytecode can answer `feeToken()`: `selector` when a PUSH4 operand is its selector (a Solidity
 * dispatcher entry), `delegates` when it executes DELEGATECALL (a proxy may forward the call), else `absent`, in
 * which case the call can only revert and the reporter pays native fees. The Solidity CBOR metadata trailer (its
 * length is the last two bytes) is skipped so its hash bytes are not read as opcodes.
 */
export function feeTokenDispatch(code: Hex): "selector" | "delegates" | "absent" {
  const hex = code.slice(2).toLowerCase();
  let bytes = hex.length / 2;
  if (bytes >= 2) {
    const metadata = parseInt(hex.slice(hex.length - 4), 16);
    const start = bytes - metadata - 2;
    // A CBOR map of one or two entries (`a1`/`a2`) starts the trailer.
    if (start >= 0 && ["a1", "a2"].includes(hex.slice(2 * start, 2 * start + 2))) bytes = start;
  }
  let delegates = false;
  for (let i = 0; i < bytes; i++) {
    const op = parseInt(hex.slice(2 * i, 2 * i + 2), 16);
    if (op === DELEGATECALL) delegates = true;
    if (op >= PUSH1 && op <= PUSH32) {
      const size = op - PUSH1 + 1;
      if (op === PUSH4 && hex.slice(2 * (i + 1), 2 * (i + 5)) === FEE_TOKEN_SELECTOR) return "selector";
      i += size;
    }
  }
  return delegates ? "delegates" : "absent";
}

function sameRoute(a: ReporterRoute, b: ReporterRoute): boolean {
  return (
    a.id === b.id &&
    a.pairId === b.pairId &&
    a.chainId === b.chainId &&
    a.reporter.toLowerCase() === b.reporter.toLowerCase() &&
    a.fundingMethod === b.fundingMethod
  );
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Whether a `ChainClient` error is an execution revert, as opposed to a transport, timeout or node failure. The
 * frozen port carries no structured error; the platform's `ChainClient` marks a contract revert with the one fixed
 * suffix `revertData=0x<hex>` or `revertData=none` and a transport error without it (decisions [L42]). Only that
 * marker is matched, never the word "reverted" or any other text, so an unmarked error defers.
 */
export function isRevert(error: unknown): boolean {
  return /(?:^|\s)revertData=(?:0x[0-9a-fA-F]*|none)$/.test(describeError(error).trim());
}

/**
 * Funding of the LayerZero, DeBridge and CCIP reporters of `@kleros/veashi-sdk@0.1.0` through their payable
 * `receive()`: a plain native transfer with no calldata. No ABI is involved; the VeaReporter has no `receive()` and
 * is never a target, which the preflight's transfer simulation catches.
 */
export class NativeTransferReporterFunding implements ReporterFunding {
  constructor(
    private readonly topology: Pick<Topology, "routes">,
    private readonly chains: ChainClients,
    private readonly signer: Address
  ) {}

  async balance(route: ReporterRoute): Promise<bigint> {
    return this.client(route).getNativeBalance(route.reporter);
  }

  async preflight(route: ReporterRoute): Promise<ReporterPreflight> {
    const reasons: string[] = [];
    if (!this.topology.routes.some((known) => sameRoute(known, route))) {
      reasons.push(`route ${route.id} is not in the configured topology (reporter ${route.reporter})`);
    }
    if (route.fundingMethod !== "nativeTransfer") {
      reasons.push(`funding method ${String(route.fundingMethod)} is not supported`);
    }
    const client = this.chains.get(route.chainId);
    if (!client) {
      reasons.push(`no chain client for chain ${route.chainId}`);
      return { ok: false, reasons };
    }
    let code: Hex;
    try {
      code = await client.getCode(route.reporter);
    } catch (error) {
      throw new PreflightUnavailable(route.id, `code lookup failed: ${describeError(error)}`);
    }
    const hasCode = code !== "0x" && code.length > 2;
    if (!hasCode) reasons.push(`no code at reporter ${route.reporter}`);
    if (hasCode) {
      const feeToken = await this.feeToken(client, route, code);
      if (feeToken) {
        reasons.push(
          `reporter ${route.reporter} pays its fees in the ERC20 feeToken ${feeToken}; ` +
            `only reporters paying native fees are supported`
        );
      }
    }
    try {
      await client.estimateGas(this.transferTx(route, PREFLIGHT_VALUE), this.signer);
    } catch (error) {
      // Only a revert says the reporter refuses the transfer; a transport failure says nothing about it.
      if (!isRevert(error)) {
        throw new PreflightUnavailable(route.id, `transfer simulation failed: ${describeError(error)}`);
      }
      reasons.push(`native transfer to the reporter does not simulate: ${describeError(error)}`);
    }
    return { ok: reasons.length === 0, reasons };
  }

  async fundingTx(route: ReporterRoute, amount: bigint): Promise<TxRequest> {
    if (amount <= 0n) throw new Error(`funding amount must be positive, got ${amount}`);
    return this.transferTx(route, amount);
  }

  /**
   * The ERC20 fee token a CCIP reporter requires, or `null` for native fees: a zero `feeToken()`, or a read that
   * reverts on bytecode that cannot dispatch `feeToken()` at all (LayerZero, DeBridge). Any other failed read (a
   * transport or unknown error, or a revert of a reporter whose code has the selector or delegates) is never taken as
   * native: it throws `PreflightUnavailable` (decisions [L30]).
   */
  private async feeToken(client: ChainClient, route: ReporterRoute, code: Hex): Promise<Address | null> {
    let token: Address;
    try {
      token = await client.readContract<Address>({
        address: route.reporter,
        abi: FEE_TOKEN_ABI,
        functionName: "feeToken",
      });
    } catch (error) {
      if (!isRevert(error)) {
        throw new PreflightUnavailable(
          route.id,
          `feeToken() of reporter ${route.reporter} could not be read: ${describeError(error)}`
        );
      }
      const dispatch = feeTokenDispatch(code);
      if (dispatch === "absent") return null;
      const why = dispatch === "selector" ? "its code has the selector" : "its code delegates";
      throw new PreflightUnavailable(
        route.id,
        `feeToken() of reporter ${route.reporter} could not be read (${why}): ${describeError(error)}`
      );
    }
    if (typeof token !== "string" || !/^0x[0-9a-fA-F]{40}$/.test(token)) {
      throw new PreflightUnavailable(route.id, `feeToken() of reporter ${route.reporter} returned ${String(token)}`);
    }
    return token.toLowerCase() === zeroAddress ? null : token;
  }

  private transferTx(route: ReporterRoute, value: bigint): TxRequest {
    return { chainId: route.chainId, to: route.reporter, value };
  }

  private client(route: ReporterRoute) {
    const client = this.chains.get(route.chainId);
    if (!client) throw new Error(`no chain client for chain ${route.chainId}`);
    return client;
  }
}
