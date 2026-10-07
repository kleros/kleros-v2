import {
  createWalletClient,
  TransactionNotFoundError,
  TransactionReceiptNotFoundError,
  type Chain,
  type PublicClient,
  type Transport,
  type WalletClient,
} from "viem";
import type { Address, ChainId, Hex, TxRequest } from "../../domain";
import { chainDefinition, makePublicClient } from "../chains/chainClient";
import { findRevertData, isExecutionRevert, shortMessage } from "../chains/rpcError";
import { GAS_PRICE_ORACLE, gasPriceOracleAbi } from "../gas/l1DataFee";
import type { ReserveRpc } from "../gas/reserve";
import type { Redact } from "../redact";

export type FeeData =
  | { type: "eip1559"; maxFeePerGas: bigint; maxPriorityFeePerGas: bigint }
  | { type: "legacy"; gasPrice: bigint };

/**
 * A redacted RPC failure: viem's short message, whether the node executed the call and it reverted (`revert`, with
 * the revert bytes found in its error chain, if any), and whether the call was abandoned by the wait budget or the
 * shutdown signal (`aborted`). A timeout, an abort or a transport failure is never a revert (decisions [L57]).
 */
export class RpcFailure extends Error {
  constructor(
    message: string,
    public readonly revertData: Hex | null,
    public readonly revert: boolean,
    public readonly aborted = false
  ) {
    super(message);
    this.name = "RpcFailure";
  }
}

/** What the executor needs from one chain. The viem implementation keeps the error chain to find revert data. */
export interface ExecutorRpc extends ReserveRpc {
  /** `eth_call` as `from`, at `blockNumber` when given (the post-state of that block); throws `RpcFailure`. */
  call(request: TxRequest, from: Address, blockNumber?: bigint): Promise<void>;
  estimateGas(request: TxRequest, from: Address): Promise<bigint>;
  feeData(baseFeeMultiplier: number): Promise<FeeData>;
  getBlockNumber(): Promise<bigint>;
  /** Native balance at `blockNumber`. */
  getBalance(address: Address, blockNumber: bigint): Promise<bigint>;
  getNonce(address: Address, block: "latest" | "pending" | bigint): Promise<number>;
  getReceipt(hash: Hex): Promise<{ blockNumber: bigint; status: "success" | "reverted"; gasUsed: bigint } | null>;
  getTransaction(hash: Hex): Promise<{ blockNumber: bigint | null } | null>;
  sendRawTransaction(raw: Hex): Promise<void>;
}

export class ViemExecutorRpc implements ExecutorRpc {
  private readonly client: PublicClient<Transport, Chain>;
  private readonly wallet: WalletClient<Transport, Chain>;

  constructor(
    transport: Transport,
    private readonly redact: Redact,
    chainId: ChainId
  ) {
    this.client = makePublicClient(chainId, transport);
    this.wallet = createWalletClient({ chain: chainDefinition(chainId), transport });
  }

  private async guard<T>(run: () => Promise<T>): Promise<T> {
    try {
      return await run();
    } catch (error) {
      throw new RpcFailure(this.redact(shortMessage(error)), findRevertData(error), isExecutionRevert(error));
    }
  }

  call(request: TxRequest, from: Address, blockNumber?: bigint): Promise<void> {
    return this.guard(async () => {
      await this.client.call({
        account: from,
        to: request.to,
        data: request.data,
        value: request.value,
        ...(blockNumber === undefined ? {} : { blockNumber }),
      });
    });
  }

  estimateGas(request: TxRequest, from: Address): Promise<bigint> {
    return this.guard(() =>
      this.client.estimateGas({ account: from, to: request.to, data: request.data, value: request.value })
    );
  }

  feeData(baseFeeMultiplier: number): Promise<FeeData> {
    return this.guard(async () => {
      const block = await this.client.getBlock({ blockTag: "latest" });
      if (block.baseFeePerGas === null || block.baseFeePerGas === undefined) {
        return { type: "legacy", gasPrice: await this.client.getGasPrice() };
      }
      const priority = await this.client.estimateMaxPriorityFeePerGas({ block } as never);
      return {
        type: "eip1559",
        maxPriorityFeePerGas: priority,
        maxFeePerGas: block.baseFeePerGas * BigInt(baseFeeMultiplier) + priority,
      };
    });
  }

  getBlockNumber(): Promise<bigint> {
    return this.guard(() => this.client.getBlockNumber({ cacheTime: 0 }));
  }

  getBalance(address: Address, blockNumber: bigint): Promise<bigint> {
    return this.guard(() => this.client.getBalance({ address, blockNumber }));
  }

  getNonce(address: Address, block: "latest" | "pending" | bigint): Promise<number> {
    return this.guard(() =>
      this.client.getTransactionCount(
        typeof block === "bigint" ? { address, blockNumber: block } : { address, blockTag: block }
      )
    );
  }

  getReceipt(hash: Hex) {
    return this.guard(async () => {
      try {
        const receipt = await this.client.getTransactionReceipt({ hash });
        return { blockNumber: receipt.blockNumber, status: receipt.status, gasUsed: receipt.gasUsed };
      } catch (error) {
        if (error instanceof TransactionReceiptNotFoundError) return null;
        throw error;
      }
    });
  }

  getTransaction(hash: Hex) {
    return this.guard(async () => {
      try {
        const tx = await this.client.getTransaction({ hash });
        return { blockNumber: tx.blockNumber ?? null };
      } catch (error) {
        if (error instanceof TransactionNotFoundError) return null;
        throw error;
      }
    });
  }

  /**
   * The OP-stack GasPriceOracle's `getL1Fee` of `unsignedTx` at `blockNumber`. Every failure (transport, timeout, an
   * oracle revert, no code at the predeploy) is a non-revert `RpcFailure` without revert data: the oracle is not the
   * request's contract, so a submit fails `aborted:` and the loops retry it without counting a rejection ([L65]).
   */
  getL1Fee(unsignedTx: Hex, blockNumber: bigint): Promise<bigint> {
    return this.client
      .readContract({
        address: GAS_PRICE_ORACLE,
        abi: gasPriceOracleAbi,
        functionName: "getL1Fee",
        args: [unsignedTx],
        blockNumber,
      })
      .catch((error: unknown) => {
        // One line: viem's message for a contract revert spans several.
        const detail = shortMessage(error).replace(/\s+/g, " ");
        throw new RpcFailure(this.redact(`L1 data fee unavailable: ${detail}`), null, false);
      });
  }

  sendRawTransaction(raw: Hex): Promise<void> {
    return this.guard(async () => {
      await this.wallet.sendRawTransaction({ serializedTransaction: raw });
    });
  }
}

/**
 * The same RPC with every call bounded (decisions [L45]): a call rejects with `RpcFailure` as soon as `budgetMs`
 * elapses or `shutdown` aborts, so one slow node cannot hold the tick slot past the wait budget. The request itself
 * may still complete in the background; its result is ignored. A spent budget (`budgetMs <= 0`) fails every call at
 * once.
 */
export function boundedRpc(rpc: ExecutorRpc, budgetMs: number, shutdown: AbortSignal): ExecutorRpc {
  const signal = budgetMs > 0 ? AbortSignal.any([shutdown, AbortSignal.timeout(budgetMs)]) : null;
  const reason = () =>
    new RpcFailure(
      shutdown.aborted
        ? "RPC call abandoned: shutdown requested"
        : `RPC call exceeded the wait budget of ${budgetMs} ms`,
      null,
      false,
      true
    );
  return new Proxy(rpc, {
    get(target, property, receiver) {
      const value: unknown = Reflect.get(target, property, receiver);
      if (typeof value !== "function") return value;
      return (...args: unknown[]): Promise<unknown> => {
        if (!signal || signal.aborted) return Promise.reject(reason());
        return new Promise((resolve, reject) => {
          const onAbort = () => reject(reason());
          signal.addEventListener("abort", onAbort, { once: true });
          (value as (...a: unknown[]) => Promise<unknown>).apply(target, args).then(
            (result) => {
              signal.removeEventListener("abort", onAbort);
              resolve(result);
            },
            (error: unknown) => {
              signal.removeEventListener("abort", onAbort);
              reject(error);
            }
          );
        });
      };
    },
  });
}
