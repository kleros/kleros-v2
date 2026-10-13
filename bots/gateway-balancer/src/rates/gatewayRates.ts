import { decodeErrorResult, encodeAbiParameters, encodeFunctionData, isHex, keccak256 } from "viem";
import { foreignGatewayAbi } from "../contracts/abi";
import { isNative, type Address, type ChainId, type Hex, type PairId, type TxRequest } from "../domain";
import type {
  ChainClient,
  ForeignGatewayRates,
  GatewayRateRejection,
  GatewayRateTarget,
  GatewayRateValue,
  KeeperGuardrails,
} from "../ports";

/** The executor's fixed suffix on `failed.error` and `reverted.reason` (decisions.md). */
const REVERT_DATA = /revertData=(0x[0-9a-fA-F]*|none)$/;

/** `currencyRates(token).rateInEth` is a uint64. */
export const MAX_RATE_IN_ETH = 2n ** 64n - 1n;

/** The decimals of `homeNativeRate` (`RATE_PRECISION` 1e18). */
export const HOME_NATIVE_DECIMALS = 18;

const ERROR_REJECTIONS: Readonly<Record<string, GatewayRateRejection>> = {
  KeeperCooldownActive: "cooldown",
  KeeperChangeTooLarge: "max-change",
  KeeperCannotChangeDecimals: "decimals",
  InvalidRate: "invalid-rate",
  GovernorOrKeeperOnly: "unauthorized",
};

/** Extracts the revert bytes from an executor error string; null for `revertData=none` or any other form. */
export function revertDataOf(error: unknown): Hex | null {
  const text = typeof error === "string" ? error : error instanceof Error ? error.message : null;
  if (text === null) return null;
  const match = REVERT_DATA.exec(text.trimEnd());
  if (!match || match[1] === "none") return null;
  const data = match[1] as Hex;
  return isHex(data, { strict: true }) && data.length >= 10 && data.length % 2 === 0 ? data : null;
}

/** Maps executor revert bytes to the guardrail of the ForeignGateway's custom error; anything else is `unknown`. */
export function classifyRateRejection(error: unknown): GatewayRateRejection {
  const data = revertDataOf(error);
  if (!data) return "unknown";
  try {
    const decoded = decodeErrorResult({ abi: foreignGatewayAbi, data });
    return ERROR_REJECTIONS[decoded.errorName] ?? "unknown";
  } catch {
    return "unknown";
  }
}

/** `lastKeeperUpdate` key of `homeNativeRate`: `keccak256(abi.encode("homeNativeRate"))`. */
export const HOME_NATIVE_RATE_KEY: Hex = keccak256(encodeAbiParameters([{ type: "string" }], ["homeNativeRate"]));

/** `lastKeeperUpdate` key of a token's rate: `keccak256(abi.encode("currencyRate", token))`. */
export function currencyRateKey(token: Address): Hex {
  return keccak256(encodeAbiParameters([{ type: "string" }, { type: "address" }], ["currencyRate", token]));
}

/** `ForeignGatewayRates` over the compiled ForeignGateway ABI. */
export class ForeignGatewayRatesAdapter implements ForeignGatewayRates {
  constructor(
    readonly pairId: PairId,
    private readonly chainId: ChainId,
    private readonly address: Address,
    private readonly chain: ChainClient
  ) {}

  private read<T>(functionName: string, args?: readonly unknown[]): Promise<T> {
    return this.chain.readContract<T>({ address: this.address, abi: foreignGatewayAbi, functionName, args });
  }

  async guardrails(): Promise<KeeperGuardrails> {
    const maxChangeBps = await this.read<bigint>("keeperMaxChangeBps");
    const cooldownSeconds = await this.read<bigint>("keeperCooldown");
    return { maxChangeBps, cooldownSeconds };
  }

  async current(target: GatewayRateTarget): Promise<GatewayRateValue> {
    let value: bigint;
    let decimals: number;
    let key: Hex;
    if (target.kind === "homeNative") {
      value = await this.read<bigint>("homeNativeRate");
      decimals = HOME_NATIVE_DECIMALS;
      key = HOME_NATIVE_RATE_KEY;
    } else {
      const token = this.tokenOf(target);
      const stored = await this.storedRate(token);
      value = stored.rateInEth;
      decimals = stored.rateDecimals;
      key = currencyRateKey(token);
    }
    const last = await this.read<bigint>("lastKeeperUpdate", [key]);
    return { value, decimals, lastKeeperUpdate: last === 0n ? null : new Date(Number(last) * 1000) };
  }

  /** Builds the keeper update; the value is never adjusted, a value the contract cannot store is refused. */
  async updateTx(target: GatewayRateTarget, value: bigint): Promise<TxRequest> {
    if (target.kind === "homeNative") {
      if (value <= 0n) throw new Error(`homeNativeRate must be positive, got ${value}`);
      return this.tx(
        encodeFunctionData({ abi: foreignGatewayAbi, functionName: "changeHomeNativeRate", args: [value] })
      );
    }
    const token = this.tokenOf(target);
    if (value <= 0n) throw new Error(`rateInEth must be positive, got ${value}`);
    if (value > MAX_RATE_IN_ETH) throw new Error(`rateInEth ${value} does not fit a uint64`);
    const { rateDecimals } = await this.storedRate(token);
    return this.tx(
      encodeFunctionData({
        abi: foreignGatewayAbi,
        functionName: "changeCurrencyRates",
        args: [token, value, rateDecimals],
      })
    );
  }

  classifyRejection(error: unknown): GatewayRateRejection {
    return classifyRateRejection(error);
  }

  private tx(data: Hex): TxRequest {
    return { chainId: this.chainId, to: this.address, data, value: 0n };
  }

  private tokenOf(target: Extract<GatewayRateTarget, { kind: "token" }>): Address {
    if (isNative(target.asset)) throw new Error(`${target.asset.symbol} is the native currency, not a token rate`);
    return target.asset.address as Address;
  }

  private async storedRate(token: Address): Promise<{ rateInEth: bigint; rateDecimals: number }> {
    const [, rateInEth, rateDecimals] = await this.read<readonly [boolean, bigint, number]>("currencyRates", [token]);
    return { rateInEth, rateDecimals: Number(rateDecimals) };
  }
}
