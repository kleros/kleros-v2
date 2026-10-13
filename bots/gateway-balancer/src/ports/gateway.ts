import type { Address, Asset, ForeignFeeCategory, PairId, TxRequest } from "../domain";

export interface ForeignGatewayBalance {
  asset: Asset;
  total: bigint;
  arbitration: bigint;
  bridging: bigint;
  atBlock: bigint;
}

/**
 * The ForeignGateway's balancer-facing surface: `availableFees(token)` (`arbitration` is the contract's juror
 * fees) and `withdrawFees(token, jurorFeeAmount, bridgingFeeAmount)`. The contract always pays its `keeper`, so
 * `recipient` must be the balancer EOA and the EOA must be the gateway's keeper.
 */
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

/**
 * A ForeignGateway value the keeper maintains from market prices.
 * - `homeNative`: `homeNativeRate`, foreign native currency per 1 unit of home native currency (Arbitrum ETH),
 *   at 18 decimals. On Arc (native USDC) it is USDC per ETH; on a chain whose native currency is ETH it stays
 *   1e18 and gets no updates.
 * - `token`: `currencyRates(token)`, KlerosCore's encoding: `rateInEth / 10^rateDecimals` is the token's price in
 *   ETH times 10^(18 - token decimals), i.e. wei per smallest token unit. Base USDC at 3000 USD/ETH is
 *   `rateInEth` 333333333 with `rateDecimals` 0. `rateInEth` is a uint64.
 */
export type GatewayRateTarget = { kind: "homeNative" } | { kind: "token"; asset: Asset };

export interface GatewayRateValue {
  /** The raw on-chain value: `homeNativeRate`, or `rateInEth`. */
  value: bigint;
  /** 18 for `homeNative`; the stored `rateDecimals` for a token (only the governor changes them). */
  decimals: number;
  /** The last keeper update of this value (`lastKeeperUpdate(key)`), or null if the keeper never updated it. */
  lastKeeperUpdate: Date | null;
}

/** The contract's limits on keeper updates; the governor is not limited and can change them at any time. */
export interface KeeperGuardrails {
  /** Max relative change of a value per keeper update, in basis points (`keeperMaxChangeBps`). */
  maxChangeBps: bigint;
  /** Min delay between two keeper updates of the same value (`keeperCooldown`). */
  cooldownSeconds: bigint;
}

/**
 * The ForeignGateway errors a keeper rate update can hit: `KeeperCooldownActive`, `KeeperChangeTooLarge`,
 * `KeeperCannotChangeDecimals`, `InvalidRate` (zero `homeNativeRate`), `GovernorOrKeeperOnly`.
 */
export type GatewayRateRejection = "cooldown" | "max-change" | "decimals" | "invalid-rate" | "unauthorized" | "unknown";

/** The keeper-maintained rates of one pair's ForeignGateway. */
export interface ForeignGatewayRates {
  readonly pairId: PairId;
  guardrails(): Promise<KeeperGuardrails>;
  current(target: GatewayRateTarget): Promise<GatewayRateValue>;
  /** Builds `changeHomeNativeRate(value)` or `changeCurrencyRates(token, value, currentDecimals)`. */
  updateTx(target: GatewayRateTarget, value: bigint): Promise<TxRequest>;
  /** Maps a revert to the contract guardrail it hit. */
  classifyRejection(error: unknown): GatewayRateRejection;
}

export interface GatewayAdapters {
  treasuries: ReadonlyMap<PairId, ForeignGatewayTreasury>;
  homeGateways: ReadonlyMap<PairId, HomeGatewayFunding>;
}
