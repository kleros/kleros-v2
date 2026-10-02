import type { Address, Asset, ForeignFeeCategory, PairId, TxRequest } from "../domain";

export interface ForeignGatewayBalance {
  asset: Asset;
  total: bigint;
  arbitration: bigint;
  bridging: bigint;
  atBlock: bigint;
}

/** The ForeignGateway's balancer-facing surface: per-category balances and the privileged withdrawal. */
export interface ForeignGatewayTreasury {
  readonly pairId: PairId;
  /** One entry per collected asset (Base: ETH and USDC). */
  balances(): Promise<ForeignGatewayBalance[]>;
  withdrawTx(input: {
    category: ForeignFeeCategory;
    asset: Asset;
    amount: bigint;
    recipient: Address;
  }): Promise<TxRequest>;
}

/** The HomeGateway's funding surface. Only native ETH is ever deposited. */
export interface HomeGatewayFunding {
  readonly pairId: PairId;
  availableNative(): Promise<bigint>;
  depositTx(amount: bigint): Promise<TxRequest>;
}

export type RateRejection = "cooldown" | "max-change" | "out-of-bounds" | "unauthorized" | "unknown";

/**
 * The ForeignGateway's currency rate: units of the pair's `rateCurrency` per 1 ETH, scaled to 1e18
 * (3000 USD/ETH is 3000e18). The adapter converts to and from the contract's own scale.
 */
export interface ForeignGatewayRate {
  readonly pairId: PairId;
  currentRate(): Promise<{ rateE18: bigint; updatedAt: Date | null }>;
  updateRateTx(rateE18: bigint): Promise<TxRequest>;
  /** Maps a revert (custom error, reason string) to the contract guardrail it hit. */
  classifyRejection(error: unknown): RateRejection;
}

export interface GatewayAdapters {
  treasuries: ReadonlyMap<PairId, ForeignGatewayTreasury>;
  homeGateways: ReadonlyMap<PairId, HomeGatewayFunding>;
}
