import { encodeFunctionData } from "viem";
import { isNative, type Address, type Asset, type ForeignFeeCategory, type PairId, type TxRequest } from "../domain";
import type { ChainClient, ForeignGatewayBalance, ForeignGatewayTreasury } from "../ports";
import { foreignGatewayAbi } from "../contracts/abi";

/** `NATIVE_CURRENCY` in the contract: the `token` argument for the chain's native asset. */
const NATIVE_TOKEN_ARGUMENT: Address = "0x0000000000000000000000000000000000000000";

function tokenArgument(asset: Asset): Address {
  return isNative(asset) ? NATIVE_TOKEN_ARGUMENT : (asset.address as Address);
}

/**
 * Reads the ForeignGateway's per-category balances (`availableFees`) and builds the balancer's withdrawal
 * (`withdrawFees`, which always pays the gateway's `keeper`, so the keeper must be the balancer EOA).
 */
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
        abi: foreignGatewayAbi,
        functionName: "availableFees",
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
    const keeper = await this.chain.readContract<Address>({
      address: this.address,
      abi: foreignGatewayAbi,
      functionName: "keeper",
    });
    if (keeper.toLowerCase() !== this.signer.toLowerCase()) {
      throw new Error(`the balancer EOA is not the keeper of the ForeignGateway of pair ${this.pairId} (${keeper})`);
    }
    const jurorFeeAmount = input.category === "arbitration" ? input.amount : 0n;
    const bridgingFeeAmount = input.category === "bridging" ? input.amount : 0n;
    return {
      chainId: this.chain.chainId,
      to: this.address,
      value: 0n,
      data: encodeFunctionData({
        abi: foreignGatewayAbi,
        functionName: "withdrawFees",
        args: [tokenArgument(input.asset), jurorFeeAmount, bridgingFeeAmount],
      }),
    };
  }
}
