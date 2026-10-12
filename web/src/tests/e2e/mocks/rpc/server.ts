import {
  decodeFunctionData,
  encodeErrorResult,
  encodeFunctionResult,
  keccak256,
  multicall3Abi,
  numberToHex,
  toHex,
  type Abi,
  type Address,
  type ContractFunctionArgs,
  type ContractFunctionName,
  type ContractFunctionReturnType,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { ACCOUNT_PKEYS } from "../../utils/accounts";

import { KNOWN_CONTRACTS } from "./contracts";

const MULTICALL3 = "0xca11bde05977b3631167028862be2a173976ca11";

export type Contract<abi extends Abi = Abi> = { address: Address; abi: abi };

export type CallContext = { from?: Address; chainId: number };

type AnyFunctionName<abi extends Abi> = ContractFunctionName<abi>;

export type CallHandler<abi extends Abi, fn extends AnyFunctionName<abi>> = (
  args: ContractFunctionArgs<abi, any, fn>,
  context: CallContext
) => ContractFunctionReturnType<abi, any, fn> | undefined;

type RegisteredCall = {
  contract: Contract;
  functionName: string;
  handler: (args: readonly unknown[], context: CallContext) => unknown;
};

export type SentTransaction = {
  hash: Hex;
  chainId: number;
  from: Address;
  to?: Address;
  data?: Hex;
  value: bigint;
  blockNumber: bigint;
  status: "success" | "reverted";
};

/** Thrown from a call handler to make the contract revert with `Error(reason)`. */
export class Revert extends Error {}

class RpcError extends Error {
  constructor(
    readonly code: number,
    message: string,
    readonly data?: Hex
  ) {
    super(message);
  }
}

/** `E2E_DEBUG_RPC=1 yarn test:e2e ...` prints every JSON-RPC exchange. */
const debug = (line: string) => {
  // eslint-disable-next-line no-console
  if (process.env.E2E_DEBUG_RPC) console.log(line);
};

const SIGNERS = Object.values(ACCOUNT_PKEYS).map((key) => privateKeyToAccount(key));

const describeCall = (to: Address, data: Hex) => {
  const contract = KNOWN_CONTRACTS.find((c) => c.address.toLowerCase() === to.toLowerCase());
  if (!contract) return `eth_call to ${to} selector ${data.slice(0, 10)}`;
  try {
    const { functionName, args } = decodeFunctionData({ abi: contract.abi, data });
    const printable = (args ?? []).map((a) => (typeof a === "bigint" ? `${a}n` : JSON.stringify(a)));
    return `eth_call ${contract.name}.${functionName}(${printable.join(", ")})`;
  } catch {
    return `eth_call ${contract.name} selector ${data.slice(0, 10)}`;
  }
};

/**
 * In-memory JSON-RPC node shared by every RPC URL of the mocked app. Contract calls are answered by
 * handlers registered with `onCall`; wagmi's Multicall3 `aggregate3` batches are unpacked transparently.
 */
export class RpcServer {
  blockNumber = 1_000_000n;
  readonly transactions: SentTransaction[] = [];
  /** Unlocked accounts reported by eth_accounts; the wagmi mock connector reads its account from here. */
  accounts: Address[] = [];
  /** Native balances in wei; unknown accounts hold 1 ETH. */
  readonly balances = new Map<string, bigint>();
  private calls: RegisteredCall[] = [];
  /** Receipt status for the next transactions, consumed in order; default "success". */
  readonly nextStatuses: SentTransaction["status"][] = [];

  constructor(
    private readonly unhandled: string[],
    private readonly now: () => number
  ) {}

  onCall<const abi extends Abi, fn extends AnyFunctionName<abi>>(
    contract: Contract<abi>,
    functionName: fn,
    handler: CallHandler<abi, fn>
  ) {
    this.calls.unshift({ contract, functionName, handler: handler as RegisteredCall["handler"] });
  }

  /** Decoded arguments of every transaction sent to `contract.functionName`, oldest first. */
  sent<const abi extends Abi, fn extends AnyFunctionName<abi>>(
    contract: Contract<abi>,
    functionName: fn
  ): { args: ContractFunctionArgs<abi, any, fn>; value: bigint; from: Address }[] {
    return this.transactions.flatMap((tx) => {
      if (!tx.data || tx.to?.toLowerCase() !== contract.address.toLowerCase()) return [];
      try {
        const decoded = decodeFunctionData({ abi: contract.abi as Abi, data: tx.data });
        return decoded.functionName === functionName
          ? [{ args: (decoded.args ?? []) as ContractFunctionArgs<abi, any, fn>, value: tx.value, from: tx.from }]
          : [];
      } catch {
        return [];
      }
    });
  }

  private ethCall(to: Address, data: Hex, context: CallContext): Hex {
    if (to.toLowerCase() === MULTICALL3) {
      const { functionName, args } = decodeFunctionData({ abi: multicall3Abi, data });
      if (functionName !== "aggregate3") throw new RpcError(-32000, `e2e rpc: Multicall3.${functionName} unsupported`);
      const results = (args[0] as readonly { target: Address; callData: Hex }[]).map((call) => {
        try {
          return { success: true, returnData: this.ethCall(call.target, call.callData, context) };
        } catch (error) {
          return { success: false, returnData: error instanceof RpcError ? (error.data ?? "0x") : "0x" };
        }
      });
      return encodeFunctionResult({ abi: multicall3Abi, functionName: "aggregate3", result: results });
    }

    for (const call of this.calls) {
      if (call.contract.address.toLowerCase() !== to.toLowerCase()) continue;
      let decoded;
      try {
        decoded = decodeFunctionData({ abi: call.contract.abi, data });
      } catch {
        continue;
      }
      if (decoded.functionName !== call.functionName) continue;
      try {
        const result = call.handler(decoded.args ?? [], context);
        return encodeFunctionResult({
          abi: call.contract.abi,
          functionName: call.functionName,
          result: result as never,
        });
      } catch (error) {
        if (!(error instanceof Revert)) throw error;
        const revertData = encodeErrorResult({
          abi: [{ type: "error", name: "Error", inputs: [{ name: "message", type: "string" }] }],
          errorName: "Error",
          args: [error.message],
        });
        throw new RpcError(3, `execution reverted: ${error.message}`, revertData);
      }
    }

    // ENS reverse lookups on mainnet: revert means "no name", which viem's getEnsName treats as null.
    if (context.chainId === 1) throw new RpcError(3, "execution reverted", "0x");
    const description = describeCall(to, data);
    this.unhandled.push(description);
    throw new RpcError(3, `e2e rpc: unmocked ${description}`, "0x");
  }

  private block(number: bigint) {
    const hash = keccak256(toHex(`block-${number}`));
    return {
      number: numberToHex(number),
      hash,
      parentHash: keccak256(toHex(`block-${number - 1n}`)),
      timestamp: numberToHex(Math.floor(this.now() / 1000)),
      nonce: "0x0000000000000000",
      difficulty: "0x0",
      totalDifficulty: "0x0",
      gasLimit: numberToHex(30_000_000),
      gasUsed: "0x0",
      baseFeePerGas: numberToHex(10_000_000),
      miner: "0x0000000000000000000000000000000000000000",
      extraData: "0x",
      logsBloom: `0x${"0".repeat(512)}`,
      sha3Uncles: keccak256("0x"),
      stateRoot: keccak256("0x"),
      transactionsRoot: keccak256("0x"),
      receiptsRoot: keccak256("0x"),
      mixHash: keccak256("0x"),
      size: "0x0",
      transactions: [],
      uncles: [],
    };
  }

  private receipt(tx: SentTransaction) {
    return {
      transactionHash: tx.hash,
      transactionIndex: "0x0",
      blockHash: keccak256(toHex(`block-${tx.blockNumber}`)),
      blockNumber: numberToHex(tx.blockNumber),
      from: tx.from,
      to: tx.to ?? null,
      cumulativeGasUsed: "0x5208",
      gasUsed: "0x5208",
      effectiveGasPrice: numberToHex(10_000_000),
      contractAddress: null,
      logs: [],
      logsBloom: `0x${"0".repeat(512)}`,
      status: tx.status === "success" ? "0x1" : "0x0",
      type: "0x2",
    };
  }

  handle(chainId: number, method: string, params: any[] = []): unknown {
    switch (method) {
      case "eth_chainId":
        return numberToHex(chainId);
      case "net_version":
        return String(chainId);
      case "eth_accounts":
        return this.accounts;
      case "eth_blockNumber":
        // A new block per poll, so viem's confirmation watchers see the chain advance.
        this.blockNumber += 1n;
        return numberToHex(this.blockNumber);
      case "eth_getBlockByNumber": {
        const tag = params[0];
        return this.block(tag === "latest" || tag === "pending" ? this.blockNumber : BigInt(tag));
      }
      case "eth_getBalance":
        return numberToHex(this.balances.get(String(params[0]).toLowerCase()) ?? 10n ** 18n);
      case "eth_getTransactionCount":
        return numberToHex(this.transactions.length);
      case "eth_gasPrice":
      case "eth_maxPriorityFeePerGas":
        return numberToHex(10_000_000);
      case "eth_estimateGas":
        return numberToHex(500_000);
      case "eth_getCode":
        return "0x00";
      case "eth_call": {
        const { to, data, input, from } = params[0];
        return this.ethCall(to, data ?? input, { from, chainId });
      }
      case "eth_sendTransaction": {
        const { from, to, data, input, value } = params[0];
        const hash = keccak256(toHex(`tx-${this.transactions.length}-${from}-${data ?? input}`));
        this.blockNumber += 1n;
        this.transactions.push({
          hash,
          chainId,
          from,
          to,
          data: data ?? input,
          value: BigInt(value ?? 0),
          blockNumber: this.blockNumber,
          status: this.nextStatuses.shift() ?? "success",
        });
        return hash;
      }
      case "eth_getTransactionReceipt": {
        const tx = this.transactions.find((t) => t.hash === params[0]);
        return tx ? this.receipt(tx) : null;
      }
      case "eth_getTransactionByHash": {
        const tx = this.transactions.find((t) => t.hash === params[0]);
        return tx
          ? {
              hash: tx.hash,
              from: tx.from,
              to: tx.to ?? null,
              input: tx.data ?? "0x",
              value: numberToHex(tx.value),
              blockNumber: numberToHex(tx.blockNumber),
              blockHash: keccak256(toHex(`block-${tx.blockNumber}`)),
              transactionIndex: "0x0",
              nonce: "0x0",
              gas: numberToHex(500_000),
              gasPrice: numberToHex(10_000_000),
              type: "0x0",
              chainId: numberToHex(chainId),
              v: "0x0",
              r: "0x0",
              s: "0x0",
            }
          : null;
      }
      case "eth_sign":
      case "personal_sign": {
        const [address, message] = method === "eth_sign" ? params : [params[1], params[0]];
        const signer = SIGNERS.find((s) => s.address.toLowerCase() === String(address).toLowerCase());
        if (!signer) throw new RpcError(-32000, `e2e rpc: no key for ${address}`);
        return signer.signMessage({ message: { raw: message } });
      }
      case "eth_signTypedData_v4": {
        const [address, typedData] = params;
        const signer = SIGNERS.find((s) => s.address.toLowerCase() === String(address).toLowerCase());
        if (!signer) throw new RpcError(-32000, `e2e rpc: no key for ${address}`);
        return signer.signTypedData(typeof typedData === "string" ? JSON.parse(typedData) : typedData);
      }
      default:
        this.unhandled.push(`JSON-RPC ${method}`);
        throw new RpcError(-32601, `e2e rpc: ${method} is not mocked`);
    }
  }

  /** Answers one JSON-RPC body (single or batch). */
  async respond(chainId: number, body: any): Promise<unknown> {
    const one = async (request: { id: number; method: string; params?: any[] }) => {
      try {
        const result = await this.handle(chainId, request.method, request.params);
        debug(`[rpc ${chainId}] ${request.method} -> ${JSON.stringify(result)?.slice(0, 200)}`);
        return { jsonrpc: "2.0", id: request.id, result };
      } catch (error) {
        debug(`[rpc ${chainId}] ${request.method} !! ${(error as Error).message}`);
        if (!(error instanceof RpcError)) throw error;
        return {
          jsonrpc: "2.0",
          id: request.id,
          error: { code: error.code, message: error.message, data: error.data },
        };
      }
    };
    return Array.isArray(body) ? Promise.all(body.map(one)) : one(body);
  }
}
