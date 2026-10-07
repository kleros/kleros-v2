import { BPS } from "../domain";
import type { PriceObservation, PriceResult } from "../ports";
import type { ProviderObservation } from "./providers/types";

export interface AggregationPolicy {
  minSources: number;
  maxSpreadBps: number;
}

export function median(values: readonly bigint[]): bigint {
  if (values.length === 0) throw new Error("median of nothing");
  const sorted = [...values].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2n;
}

/** Deviation of `value` from `reference` in basis points, rounded up. */
export function deviationBps(value: bigint, reference: bigint): number {
  if (reference <= 0n) return Number.POSITIVE_INFINITY;
  const diff = value > reference ? value - reference : reference - value;
  return Number((diff * BPS + reference - 1n) / reference);
}

/**
 * Median of the fresh observations of one symbol. Stale and failed observations are excluded. Observations are
 * grouped by source family (all Chainlink feeds are one family): each family contributes the median of its fresh
 * observations, the price is the median of those family values, and `minSources` counts families, so one oracle
 * network never supplies two of the required sources. Fewer than `minSources` fresh families give `stale` (when
 * staleness is why), `error` (when failures are why) or `insufficient-sources`; any fresh observation further than
 * `maxSpreadBps` from the price gives `disagreement`. No symbol is assumed pegged: a USDC price away from 1 USD is
 * returned as observed.
 */
export function aggregate(
  base: string,
  observations: readonly ProviderObservation[],
  policy: AggregationPolicy
): PriceResult {
  const fresh = observations.filter((o): o is Extract<ProviderObservation, { kind: "price" }> => o.kind === "price");
  const stale = observations.filter((o) => o.kind === "stale");
  const errors = observations.filter((o) => o.kind === "error");
  const describe = (list: readonly ProviderObservation[]) =>
    list.map((o) => `${o.source}: ${"detail" in o ? o.detail : "fresh"}`).join("; ");
  const families = new Map<string, bigint[]>();
  for (const o of fresh) families.set(o.family, [...(families.get(o.family) ?? []), o.priceE18]);
  if (families.size < policy.minSources) {
    const reason = stale.length > 0 ? "stale" : errors.length > 0 ? "error" : "insufficient-sources";
    return {
      kind: "unavailable",
      base,
      reason,
      detail:
        `${families.size} fresh source families of ${policy.minSources} required` +
        (families.size > 0 ? ` [${[...families.keys()].join(", ")}]` : "") +
        (stale.length + errors.length > 0 ? ` (${describe([...stale, ...errors])})` : ""),
    };
  }
  const priceE18 = median([...families.values()].map((prices) => median(prices)));
  const spreadBps = Math.max(...fresh.map((o) => deviationBps(o.priceE18, priceE18)));
  if (spreadBps > policy.maxSpreadBps) {
    return {
      kind: "unavailable",
      base,
      reason: "disagreement",
      detail:
        `spread ${spreadBps} bps over ${policy.maxSpreadBps} bps: ` +
        fresh.map((o) => `${o.source}=${o.priceE18}`).join(", "),
    };
  }
  const used: PriceObservation[] = fresh.map((o) => ({
    source: o.source,
    priceE18: o.priceE18,
    observedAt: o.observedAt,
  }));
  const at = new Date(Math.min(...fresh.map((o) => o.observedAt.getTime())));
  return { kind: "price", base, priceE18, observations: used, spreadBps, at };
}
