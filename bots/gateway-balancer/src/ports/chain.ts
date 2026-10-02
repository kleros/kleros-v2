import type { Abi } from "viem";
import type { Address, ChainId, Hex, TxRequest } from "../domain";

export interface TransactionReceiptView {
  hash: Hex;
  blockNumber: bigint;
  status: "success" | "reverted";
  gasUsed: bigint;
  effectiveGasPrice: bigint;
  from: Address;
  to: Address | null;
}

export interface TransactionView {
  hash: Hex;
  nonce: number;
  from: Address;
  /** null while pending. */
  blockNumber: bigint | null;
}

/** Read-only access to one chain. One instance per configured chain; never signs. */
export interface ChainClient {
  readonly chainId: ChainId;
  getBlockNumber(): Promise<bigint>;
  getNativeBalance(address: Address): Promise<bigint>;
  getErc20Balance(token: Address, holder: Address): Promise<bigint>;
  /** "0x" when the address has no code. */
  getCode(address: Address): Promise<Hex>;
  readContract<T = unknown>(call: {
    address: Address;
    abi: Abi;
    functionName: string;
    args?: readonly unknown[];
  }): Promise<T>;
  /** Estimates gas as a simulation from `from`; throws with the revert reason when the call would revert. */
  estimateGas(request: TxRequest, from: Address): Promise<bigint>;
  getTransactionReceipt(hash: Hex): Promise<TransactionReceiptView | null>;
  getTransaction(hash: Hex): Promise<TransactionView | null>;
  getTransactionCount(address: Address, block: "latest" | "pending"): Promise<number>;
}

export type ChainClients = ReadonlyMap<ChainId, ChainClient>;
