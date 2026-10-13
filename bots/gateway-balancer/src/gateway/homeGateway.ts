import { encodeFunctionData } from "viem";
import type { Address, PairId, TxRequest } from "../domain";
import type { ChainClient, HomeGatewayFunding } from "../ports";
import { WRAPPED_NATIVE_ABI } from "./abi/weth";

/** The HomeGateway is funded by a plain native transfer to its `receive()`: value with empty calldata. */
export type DepositMethod = "nativeTransfer";

/** The HomeGateway's native balance and its native-only deposit. */
export class HomeGatewayFundingAdapter implements HomeGatewayFunding {
  constructor(
    readonly pairId: PairId,
    private readonly chain: ChainClient,
    private readonly address: Address
  ) {}

  async availableNative(): Promise<bigint> {
    return this.chain.getNativeBalance(this.address);
  }

  async depositTx(amount: bigint): Promise<TxRequest> {
    if (amount <= 0n) throw new Error("deposit amount must be positive");
    return { chainId: this.chain.chainId, to: this.address, value: amount };
  }
}

/** Unwraps `amount` of the chain's wrapped native (WETH9 `withdraw`) into native for the sender. */
export function unwrapTx(chainId: number, wrappedNative: Address, amount: bigint): TxRequest {
  if (amount <= 0n) throw new Error("unwrap amount must be positive");
  return {
    chainId,
    to: wrappedNative,
    value: 0n,
    data: encodeFunctionData({ abi: WRAPPED_NATIVE_ABI, functionName: "withdraw", args: [amount] }),
  };
}
