import type { PriceOracle, PriceResult } from "../ports";

export class FakePriceOracle implements PriceOracle {
  readonly results = new Map<string, PriceResult>();

  set(base: string, priceE18: bigint, options: { sources?: number; at?: Date; spreadBps?: number } = {}): this {
    const at = options.at ?? new Date("2026-01-01T00:00:00Z");
    const sources = options.sources ?? 3;
    this.results.set(base, {
      kind: "price",
      base,
      priceE18,
      observations: Array.from({ length: sources }, (_, i) => ({ source: `fake-${i + 1}`, priceE18, observedAt: at })),
      spreadBps: options.spreadBps ?? 0,
      at,
    });
    return this;
  }

  setUnavailable(base: string, reason: Extract<PriceResult, { kind: "unavailable" }>["reason"], detail = ""): this {
    this.results.set(base, { kind: "unavailable", base, reason, detail });
    return this;
  }

  async price(base: string): Promise<PriceResult> {
    return (
      this.results.get(base) ?? {
        kind: "unavailable",
        base,
        reason: "insufficient-sources",
        detail: "no fake price set",
      }
    );
  }
}
