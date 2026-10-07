import { encodeFunctionData, type Abi } from "viem";
import { isNative, type Address, type Asset, type ForeignFeeCategory, type PairId, type TxRequest } from "../domain";
import type { ChainClient, ForeignGatewayBalance, ForeignGatewayTreasury } from "../ports";
import { FEE_CATEGORY, FOREIGN_GATEWAY_TREASURY_ABI, NATIVE_TOKEN_ARGUMENT } from "./abi/foreignGateway";

function tokenArgument(asset: Asset): Address {
  return isNative(asset) ? NATIVE_TOKEN_ARGUMENT : (asset.address as Address);
}

/** Reads the ForeignGateway's per-category balances and builds the balancer's withdrawal, over the pending fragment. */
export class ForeignGatewayTreasuryAdapter implements ForeignGatewayTreasury {
  constructor(
    readonly pairId: PairId,
    private readonly chain: ChainClient,
    private readonly address: Address,
    private readonly collectedAssets: readonly Asset[],
    private readonly signer: Address
  ) {}

  async balances(): Promise<ForeignGatewayBalance[]> {
    const atBlock = await this.chain.getBlockNumber();
    const result: ForeignGatewayBalance[] = [];
    for (const asset of this.collectedAssets) {
      const [total, arbitration, bridging] = await this.chain.readContract<readonly [bigint, bigint, bigint]>({
        address: this.address,
        abi: FOREIGN_GATEWAY_TREASURY_ABI as Abi,
        functionName: "feeBalances",
        args: [tokenArgument(asset)],
      });
      result.push({ asset: { ...asset }, total, arbitration, bridging, atBlock });
    }
    return result;
  }

  async withdrawTx(input: {
    category: ForeignFeeCategory;
    asset: Asset;
    amount: bigint;
    recipient: Address;
  }): Promise<TxRequest> {
    if (input.recipient.toLowerCase() !== this.signer.toLowerCase()) {
      throw new Error(`withdrawal recipient ${input.recipient} is not the balancer EOA`);
    }
    if (input.amount <= 0n) throw new Error("withdrawal amount must be positive");
    if (!this.collectedAssets.some((a) => a.address.toLowerCase() === input.asset.address.toLowerCase())) {
      throw new Error(`asset ${input.asset.symbol} is not collected by pair ${this.pairId}`);
    }
    return {
      chainId: this.chain.chainId,
      to: this.address,
      value: 0n,
      data: encodeFunctionData({
        abi: FOREIGN_GATEWAY_TREASURY_ABI,
        functionName: "withdrawFees",
        args: [FEE_CATEGORY[input.category], tokenArgument(input.asset), input.amount, input.recipient],
      }),
    };
  }
}
