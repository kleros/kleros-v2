import type { Address, Asset, ChainId, ForeignFeeCategory, PairId, TxRequest } from "../domain";
import type {
  ForeignGatewayBalance,
  ForeignGatewayRates,
  ForeignGatewayTreasury,
  GatewayRateRejection,
  GatewayRateTarget,
  GatewayRateValue,
  HomeGatewayFunding,
  KeeperGuardrails,
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

function targetId(target: GatewayRateTarget): string {
  return target.kind === "homeNative" ? "homeNative" : `token:${target.asset.address.toLowerCase()}`;
}

/** In-memory `ForeignGatewayRates`: set values per target, record updates, tag errors with `{ rejection }`. */
export class FakeForeignGatewayRates implements ForeignGatewayRates {
  guardrailValues: KeeperGuardrails = { maxChangeBps: 500n, cooldownSeconds: 3600n };
  rejection: GatewayRateRejection = "unknown";
  readonly updates: Array<{ target: GatewayRateTarget; value: bigint }> = [];
  private readonly values = new Map<string, GatewayRateValue>();

  constructor(
    readonly pairId: PairId,
    readonly chainId: ChainId,
    readonly address: Address
  ) {}

  setValue(target: GatewayRateTarget, value: bigint, decimals: number, lastKeeperUpdate: Date | null = null): void {
    this.values.set(targetId(target), { value, decimals, lastKeeperUpdate });
  }

  async guardrails(): Promise<KeeperGuardrails> {
    return { ...this.guardrailValues };
  }

  async current(target: GatewayRateTarget): Promise<GatewayRateValue> {
    const entry = this.values.get(targetId(target));
    if (!entry) throw new Error(`FakeForeignGatewayRates: no value set for ${targetId(target)}`);
    const { lastKeeperUpdate } = entry;
    return { ...entry, lastKeeperUpdate: lastKeeperUpdate ? new Date(lastKeeperUpdate.getTime()) : null };
  }

  async updateTx(target: GatewayRateTarget, value: bigint): Promise<TxRequest> {
    this.updates.push({ target: target.kind === "token" ? { ...target, asset: { ...target.asset } } : target, value });
    return { chainId: this.chainId, to: this.address, data: "0x7a7e", value: 0n };
  }

  classifyRejection(error: unknown): GatewayRateRejection {
    const tagged = error as { rejection?: GatewayRateRejection } | null;
    return tagged?.rejection ?? this.rejection;
  }
}
