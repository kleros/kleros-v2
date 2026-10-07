import { assetKey, foreignGatewayClaimKey, type Asset, type PairId } from "../domain";
import type { ForeignGatewayBalance } from "../ports";
import { economicMinimum, type PairRefillSettings } from "./config";

/**
 * The refill planner (specification 3): trigger strictly below `lowWaterCases * referenceCaseCost` of available
 * native ETH; sweep every collected asset's withdrawable arbitration balance (never the bridging category, which
 * belongs to the reporter lane); defer amounts under the economic minimum. Pure: the loop reads, this decides.
 */

export interface Capacity {
  availableNative: bigint;
  lowWater: bigint;
  target: bigint;
  referenceCaseCost: bigint;
  /** Available capacity in reference cases, two decimals. */
  cases: number;
}

export interface SweepItem {
  asset: Asset;
  amount: bigint;
  claimKey: string;
}

export interface DeferredItem {
  asset: Asset;
  amount: bigint;
  reason: string;
}

export type RefillPlan =
  | { kind: "not-configured"; reason: string }
  | { kind: "above-trigger"; capacity: Capacity }
  | { kind: "nothing-to-sweep"; capacity: Capacity; deferred: DeferredItem[] }
  | {
      kind: "sweep";
      capacity: Capacity;
      sweep: SweepItem[];
      deferred: DeferredItem[];
      /** Estimated ETH the sweep brings (oracle prices, before losses); null when an asset could not be priced. */
      expectedEth: bigint | null;
      /** True when available plus the expected sweep stays under the target; null when unknown. */
      partial: boolean | null;
    };

export function capacityOf(availableNative: bigint, settings: PairRefillSettings): Capacity | null {
  const cost = settings.referenceCaseCostWei;
  if (cost === null || cost <= 0n) return null;
  return {
    availableNative,
    lowWater: cost * BigInt(settings.lowWaterCases),
    target: cost * BigInt(settings.targetCases),
    referenceCaseCost: cost,
    cases: Number((availableNative * 100n) / cost) / 100,
  };
}

/** Strictly below the low-water mark. */
export function shouldTrigger(capacity: Capacity): boolean {
  return capacity.availableNative < capacity.lowWater;
}

export interface PlanInput {
  pairId: PairId;
  settings: PairRefillSettings;
  availableNative: bigint;
  /** The pair's own ForeignGateway balances; nothing of another pair is ever passed in. */
  balances: readonly ForeignGatewayBalance[];
  /** Open claims per claim key (e.g. an operation in attention whose withdrawal is unresolved). */
  openClaims: ReadonlyMap<string, bigint>;
  /** ETH value of an amount of a collected asset at oracle prices; null when unavailable. */
  ethValue: (asset: Asset, amount: bigint) => bigint | null;
}

export function arbitrationClaimKey(pairId: PairId, asset: Pick<Asset, "chainId" | "address">): string {
  return foreignGatewayClaimKey(pairId, "arbitration", assetKey(asset));
}

export function planRefill(input: PlanInput): RefillPlan {
  if (!input.settings.enabled) return { kind: "not-configured", reason: "refill disabled for this pair" };
  const capacity = capacityOf(input.availableNative, input.settings);
  if (!capacity) return { kind: "not-configured", reason: "referenceCaseCostEth is not configured" };
  if (!shouldTrigger(capacity)) return { kind: "above-trigger", capacity };
  const sweep: SweepItem[] = [];
  const deferred: DeferredItem[] = [];
  for (const balance of input.balances) {
    const claimKey = arbitrationClaimKey(input.pairId, balance.asset);
    const claimable = balance.arbitration - (input.openClaims.get(claimKey) ?? 0n);
    if (claimable <= 0n) continue;
    const minimum = economicMinimum(input.settings, balance.asset.symbol, balance.asset.decimals);
    if (claimable < minimum) {
      deferred.push({ asset: balance.asset, amount: claimable, reason: `under the economic minimum ${minimum}` });
      continue;
    }
    sweep.push({ asset: { ...balance.asset }, amount: claimable, claimKey });
  }
  if (sweep.length === 0) return { kind: "nothing-to-sweep", capacity, deferred };
  let expectedEth: bigint | null = 0n;
  for (const item of sweep) {
    const value = input.ethValue(item.asset, item.amount);
    expectedEth = value === null || expectedEth === null ? null : expectedEth + value;
  }
  const partial = expectedEth === null ? null : capacity.availableNative + expectedEth < capacity.target;
  return { kind: "sweep", capacity, sweep, deferred, expectedEth, partial };
}
