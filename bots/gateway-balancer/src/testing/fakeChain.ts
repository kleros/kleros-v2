import type { Abi } from "viem";
import type { Address, ChainId, Hex, TxRequest } from "../domain";
import type { ChainClient, TransactionReceiptView, TransactionView } from "../ports";

export interface ReadCall {
  address: Address;
  abi: Abi;
  functionName: string;
  args?: readonly unknown[];
}

type ReadScript = { match: (call: ReadCall) => boolean; result: unknown | ((call: ReadCall) => unknown) };

export class FakeChainClient implements ChainClient {
  blockNumber = 1000n;
  readonly native = new Map<string, bigint>();
  readonly erc20 = new Map<string, bigint>();
  readonly code = new Map<string, Hex>();
  readonly receipts = new Map<Hex, TransactionReceiptView>();
  readonly transactions = new Map<Hex, TransactionView>();
  readonly nonces = new Map<string, number>();
  readonly reads: ReadScript[] = [];
  estimate: (request: TxRequest, from: Address) => bigint = () => 21_000n;

  constructor(readonly chainId: ChainId) {}

  setNativeBalance(address: Address, amount: bigint): void {
    this.native.set(address.toLowerCase(), amount);
  }

  setErc20Balance(token: Address, holder: Address, amount: bigint): void {
    this.erc20.set(`${token.toLowerCase()}:${holder.toLowerCase()}`, amount);
  }

  setCode(address: Address, code: Hex = "0x6001"): void {
    this.code.set(address.toLowerCase(), code);
  }

  onRead(match: (call: ReadCall) => boolean, result: ReadScript["result"]): this {
    this.reads.push({ match, result });
    return this;
  }

  async getBlockNumber(): Promise<bigint> {
    return this.blockNumber;
  }

  async getNativeBalance(address: Address): Promise<bigint> {
    return this.native.get(address.toLowerCase()) ?? 0n;
  }

  async getErc20Balance(token: Address, holder: Address): Promise<bigint> {
    return this.erc20.get(`${token.toLowerCase()}:${holder.toLowerCase()}`) ?? 0n;
  }

  async getCode(address: Address): Promise<Hex> {
    return this.code.get(address.toLowerCase()) ?? "0x";
  }

  async readContract<T = unknown>(call: ReadCall): Promise<T> {
    const script = this.reads.find((r) => r.match(call));
    if (!script)
      throw new Error(`FakeChainClient(${this.chainId}): no read scripted for ${call.functionName} at ${call.address}`);
    return (
      typeof script.result === "function" ? (script.result as (c: ReadCall) => unknown)(call) : script.result
    ) as T;
  }

  async estimateGas(request: TxRequest, from: Address): Promise<bigint> {
    return this.estimate(request, from);
  }

  async getTransactionReceipt(hash: Hex): Promise<TransactionReceiptView | null> {
    return this.receipts.get(hash) ?? null;
  }

  async getTransaction(hash: Hex): Promise<TransactionView | null> {
    return this.transactions.get(hash) ?? null;
  }

  async getTransactionCount(address: Address, _: "latest" | "pending"): Promise<number> {
    return this.nonces.get(address.toLowerCase()) ?? 0;
  }
}
