export interface PriceObservation {
  source: string;
  priceE18: bigint;
  observedAt: Date;
}

export type PriceResult =
  | {
      kind: "price";
      base: string;
      /** USD per unit of `base`, scaled to 1e18; the median of the fresh observations. */
      priceE18: bigint;
      observations: PriceObservation[];
      /** Max deviation between observations and the median, in basis points. */
      spreadBps: number;
      at: Date;
    }
  | {
      kind: "unavailable";
      base: string;
      reason: "stale" | "disagreement" | "insufficient-sources" | "error";
      detail: string;
    };

/** Aggregated USD prices ("ETH", "USDC"): median of at least the configured number of fresh, agreeing sources. */
export interface PriceOracle {
  price(base: string): Promise<PriceResult>;
}
