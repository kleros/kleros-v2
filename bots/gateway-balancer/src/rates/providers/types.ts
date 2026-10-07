/**
 * One provider's answer for one symbol. Providers never throw: a failure is an `error` observation. `family` is the
 * independent source family (the oracle network or data vendor) the observation comes from: feeds of one family
 * share a failure mode, so the aggregator counts a family once toward `minSources`.
 */
export type ProviderObservation =
  | { kind: "price"; source: string; family: string; base: string; priceE18: bigint; observedAt: Date }
  | { kind: "stale"; source: string; family: string; base: string; priceE18: bigint; observedAt: Date; detail: string }
  | { kind: "error"; source: string; family: string; base: string; detail: string };

/** The provider seam: Chainlink and CoinGecko today, Pyth later. `id` is the configuration discriminator. */
export interface PriceProvider {
  readonly id: string;
  /** Independent source family; every built-in provider uses its `id` (all Chainlink feeds are one family). */
  readonly family: string;
  /** Label of its observations, unique across the configured providers. */
  readonly source: string;
  observe(base: string): Promise<ProviderObservation>;
}

export function errorDetail(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.length > 300 ? `${message.slice(0, 300)}…` : message;
}

/** Scales an integer `value` at `decimals` to 1e18. */
export function toE18(value: bigint, decimals: number): bigint {
  if (decimals === 18) return value;
  if (decimals < 18) return value * 10n ** BigInt(18 - decimals);
  return value / 10n ** BigInt(decimals - 18);
}
