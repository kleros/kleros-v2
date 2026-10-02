import type { Address, Asset, ChainId, ForeignFeeCategory, PairId, TxRequest } from "../domain";
import type {
  ForeignGatewayBalance,
  ForeignGatewayRate,
  ForeignGatewayTreasury,
  HomeGatewayFunding,
  RateRejection,
} from "../ports";

export class FakeForeignGatewayTreasury implements ForeignGatewayTreasury {
  balanceList: ForeignGatewayBalance[] = [];
  readonly withdrawals: Array<{ category: ForeignFeeCategory; asset: Asset; amount: bigint; recipient: Address }> = [];

  constructor(
    readonly pairId: PairId,
    readonly chainId: ChainId,
    readonly address: Address
  ) {}

  setBalance(asset: Asset, arbitration: bigint, bridging: bigint, atBlock = 1000n): void {
    const existing = this.balanceList.findIndex((b) => b.asset.address.toLowerCase() === asset.address.toLowerCase());
    const entry: ForeignGatewayBalance = { asset, arbitration, bridging, total: arbitration + bridging, atBlock };
    if (existing >= 0) this.balanceList[existing] = entry;
    else this.balanceList.push(entry);
  }

  async balances(): Promise<ForeignGatewayBalance[]> {
    return this.balanceList.map((b) => ({ ...b, asset: { ...b.asset } }));
  }

  async withdrawTx(input: {
    category: ForeignFeeCategory;
    asset: Asset;
    amount: bigint;
    recipient: Address;
  }): Promise<TxRequest> {
    this.withdrawals.push({ ...input, asset: { ...input.asset } });
    return { chainId: this.chainId, to: this.address, data: "0xfa5e", value: 0n };
  }
}

export class FakeHomeGatewayFunding implements HomeGatewayFunding {
  available = 0n;
  readonly deposits: bigint[] = [];

  constructor(
    readonly pairId: PairId,
    readonly chainId: ChainId,
    readonly address: Address
  ) {}

  async availableNative(): Promise<bigint> {
    return this.available;
  }

  async depositTx(amount: bigint): Promise<TxRequest> {
    this.deposits.push(amount);
    return { chainId: this.chainId, to: this.address, value: amount };
  }
}

export class FakeForeignGatewayRate implements ForeignGatewayRate {
  rateE18 = 0n;
  updatedAt: Date | null = null;
  rejection: RateRejection = "unknown";
  readonly updates: bigint[] = [];

  constructor(
    readonly pairId: PairId,
    readonly chainId: ChainId,
    readonly address: Address
  ) {}

  async currentRate(): Promise<{ rateE18: bigint; updatedAt: Date | null }> {
    return { rateE18: this.rateE18, updatedAt: this.updatedAt ? new Date(this.updatedAt.getTime()) : null };
  }

  async updateRateTx(rateE18: bigint): Promise<TxRequest> {
    this.updates.push(rateE18);
    return { chainId: this.chainId, to: this.address, data: "0x7a7e", value: 0n };
  }

  classifyRejection(error: unknown): RateRejection {
    const tagged = error as { rejection?: RateRejection } | null;
    return tagged?.rejection ?? this.rejection;
  }
}
