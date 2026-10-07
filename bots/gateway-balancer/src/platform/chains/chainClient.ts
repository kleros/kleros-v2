import {
  createPublicClient,
  defineChain,
  erc20Abi,
  http,
  TransactionNotFoundError,
  TransactionReceiptNotFoundError,
  type Abi,
  type Chain,
  type PublicClient,
  type Transport,
} from "viem";
import type { Address, ChainId, Hex, TxRequest } from "../../domain";
import type { ChainClient, TransactionReceiptView, TransactionView } from "../../ports";
import type { Redact } from "../redact";
import { plainRpcError } from "./rpcError";

/** The HTTP transport of one chain; retries are few so a dead RPC fails inside the tick budget. */
export function chainTransport(url: string, timeoutMs = 20_000): Transport {
  return http(url, { retryCount: 2, timeout: timeoutMs });
}

/** A minimal viem chain definition for a topology chain: the id is what matters; RPC URLs live in the transport. */
export function chainDefinition(chainId: ChainId, name = `chain-${chainId}`): Chain {
  return defineChain({
    id: chainId,
    name,
    nativeCurrency: { name: "native", symbol: "NATIVE", decimals: 18 },
    rpcUrls: { default: { http: [] } },
  });
}

export function makePublicClient(chainId: ChainId, transport: Transport): PublicClient<Transport, Chain> {
  return createPublicClient({ chain: chainDefinition(chainId), transport });
}

/**
 * The read-only `ChainClient` over viem. Every error is caught and rethrown as a plain redacted `Error` carrying
 * viem's `shortMessage` (and `revertData=` when the node returned revert bytes): never the URL, the request body
 * or the viem error chain.
 */
export class ViemChainClient implements ChainClient {
  private readonly client: PublicClient<Transport, Chain>;

  constructor(
    readonly chainId: ChainId,
    transport: Transport,
    private readonly redact: Redact
  ) {
    this.client = makePublicClient(chainId, transport);
  }

  private async guard<T>(run: () => Promise<T>): Promise<T> {
    try {
      return await run();
    } catch (error) {
      throw plainRpcError(error, this.redact);
    }
  }

  getBlockNumber(): Promise<bigint> {
    return this.guard(() => this.client.getBlockNumber({ cacheTime: 0 }));
  }

  getNativeBalance(address: Address): Promise<bigint> {
    return this.guard(() => this.client.getBalance({ address }));
  }

  getErc20Balance(token: Address, holder: Address): Promise<bigint> {
    return this.guard(() =>
      this.client.readContract({ address: token, abi: erc20Abi, functionName: "balanceOf", args: [holder] })
    );
  }

  getCode(address: Address): Promise<Hex> {
    return this.guard(async () => (await this.client.getCode({ address })) ?? "0x");
  }

  readContract<T = unknown>(call: {
    address: Address;
    abi: Abi;
    functionName: string;
    args?: readonly unknown[];
  }): Promise<T> {
    return this.guard(async () => (await this.client.readContract(call as never)) as T);
  }

  estimateGas(request: TxRequest, from: Address): Promise<bigint> {
    return this.guard(() =>
      this.client.estimateGas({ account: from, to: request.to, data: request.data, value: request.value })
    );
  }

  getTransactionReceipt(hash: Hex): Promise<TransactionReceiptView | null> {
    return this.guard(async () => {
      try {
        const receipt = await this.client.getTransactionReceipt({ hash });
        return {
          hash: receipt.transactionHash,
          blockNumber: receipt.blockNumber,
          status: receipt.status,
          gasUsed: receipt.gasUsed,
          effectiveGasPrice: receipt.effectiveGasPrice,
          from: receipt.from,
          to: receipt.to,
        };
      } catch (error) {
        if (error instanceof TransactionReceiptNotFoundError) return null;
        throw error;
      }
    });
  }

  getTransaction(hash: Hex): Promise<TransactionView | null> {
    return this.guard(async () => {
      try {
        const tx = await this.client.getTransaction({ hash });
        return { hash: tx.hash, nonce: tx.nonce, from: tx.from, blockNumber: tx.blockNumber ?? null };
      } catch (error) {
        if (error instanceof TransactionNotFoundError) return null;
        throw error;
      }
    });
  }

  getTransactionCount(address: Address, block: "latest" | "pending"): Promise<number> {
    return this.guard(() => this.client.getTransactionCount({ address, blockTag: block }));
  }
}
