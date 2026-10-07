import type { CreatePriceOracle, CreateRatesLoops } from "../ports";
import { ForeignGatewayRateAdapter } from "./gatewayRate";
import { RateLoop } from "./loop";
import { AggregatedPriceOracle, buildProviders } from "./oracle";

export { aggregate, median } from "./aggregator";
export { ratesConfigSchema, type RatesConfig } from "./config";
export { ForeignGatewayRateAdapter, classifyRateRejection } from "./gatewayRate";
export { RateLoop } from "./loop";
export type { PriceProvider, ProviderObservation } from "./providers/types";

/**
 * Rates lane: price aggregation (median of fresh sources) and one rate-maintenance loop per pair with a rate
 * currency.
 */
export const createPriceOracle: CreatePriceOracle = (ports) => {
  const config = ports.config.rates;
  return new AggregatedPriceOracle(buildProviders(config, ports), config);
};

export const createRatesLoops: CreateRatesLoops = (ports, { priceOracle }) => {
  const config = ports.config.rates;
  const pairs = ports.config.topology.pairs;
  for (const pairId of Object.keys(config.pairs)) {
    if (!pairs.some((pair) => pair.id === pairId)) throw new Error(`rates.pairs: unknown pair ${pairId}`);
  }
  return pairs
    .filter((pair) => pair.rateCurrency !== undefined)
    .map((pair) => {
      const chain = ports.chains.get(pair.foreignChainId);
      if (!chain) throw new Error(`rates: no chain client for ${pair.id}'s foreign chain ${pair.foreignChainId}`);
      const rate = new ForeignGatewayRateAdapter(pair.id, pair.foreignChainId, pair.foreignGateway, chain);
      return new RateLoop(ports, { pair, rate, priceOracle, config });
    });
};
