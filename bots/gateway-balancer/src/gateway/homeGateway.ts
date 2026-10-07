import { encodeFunctionData } from "viem";
import type { Address, PairId, TxRequest } from "../domain";
import type { ChainClient, HomeGatewayFunding } from "../ports";
import { HOME_GATEWAY_FUNDING_ABI } from "./abi/homeGateway";
import { WRAPPED_NATIVE_ABI } from "./abi/weth";

/**
 * `function`: the pending fragment's payable deposit; `nativeTransfer`: value with empty calldata (only for a
 * gateway whose `receive()` is verified).
 */
export type DepositMethod = "function" | "nativeTransfer";

/** The HomeGateway's native balance and its native-only deposit. */
export class HomeGatewayFundingAdapter implements HomeGatewayFunding {
  constructor(
    readonly pairId: PairId,
    private readonly chain: ChainClient,
    private readonly address: Address,
    private readonly depositMethod: DepositMethod = "function"
  ) {}

  async availableNative(): Promise<bigint> {
    return this.chain.getNativeBalance(this.address);
  }

  async depositTx(amount: bigint): Promise<TxRequest> {
    if (amount <= 0n) throw new Error("deposit amount must be positive");
    const request: TxRequest = { chainId: this.chain.chainId, to: this.address, value: amount };
    if (this.depositMethod === "function") {
      request.data = encodeFunctionData({ abi: HOME_GATEWAY_FUNDING_ABI, functionName: "depositNative" });
    }
    return request;
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
