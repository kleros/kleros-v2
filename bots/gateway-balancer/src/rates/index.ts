import type { CreatePriceOracle, CreateRatesLoops } from "../ports";

/**
 * Rates lane: price aggregation (median of fresh sources) and one rate-maintenance loop per pair with a rate
 * currency.
 */
export const createPriceOracle: CreatePriceOracle = () => ({
  price: async (base) => ({
    kind: "unavailable",
    base,
    reason: "error",
    detail: "rates lane: createPriceOracle is not implemented yet",
  }),
});

export const createRatesLoops: CreateRatesLoops = () => [];
