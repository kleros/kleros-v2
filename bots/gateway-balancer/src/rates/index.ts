import type { ChainConfig, PairConfig } from "../config/schema";
import { isNative } from "../domain";
import type { CreatePriceOracle, CreateRatesLoops, GatewayRateTarget } from "../ports";
import type { RateTargetConfig } from "./config";
import { ForeignGatewayRatesAdapter } from "./gatewayRates";
import { RateLoop, rateTargetName } from "./loop";
import { AggregatedPriceOracle, buildProviders } from "./oracle";

export { aggregate, median } from "./aggregator";
export { ratesConfigSchema, type RatesConfig } from "./config";
export { ForeignGatewayRatesAdapter, classifyRateRejection } from "./gatewayRates";
export { RateLoop } from "./loop";
export type { PriceProvider, ProviderObservation } from "./providers/types";

/**
 * Rates lane: price aggregation (median of fresh sources) and one rate-maintenance loop per configured pair and
 * rate target.
 */
export const createPriceOracle: CreatePriceOracle = (ports) => {
  const config = ports.config.rates;
  return new AggregatedPriceOracle(buildProviders(config, ports), config);
};

export const createRatesLoops: CreateRatesLoops = (ports, { priceOracle }) => {
  const config = ports.config.rates;
  const { chains, pairs } = ports.config.topology;
  for (const pairId of Object.keys(config.pairs)) {
    if (!pairs.some((pair) => pair.id === pairId)) throw new Error(`rates.pairs: unknown pair ${pairId}`);
  }
  // Targets come only from the configuration, never from the topology: an empty section creates no loop.
  return pairs.flatMap((pair) => {
    const pairRates = config.pairs[pair.id];
    if (!pairRates) return [];
    const chain = ports.chains.get(pair.foreignChainId);
    if (!chain) throw new Error(`rates: no chain client for ${pair.id}'s foreign chain ${pair.foreignChainId}`);
    const rates = new ForeignGatewayRatesAdapter(pair.id, pair.foreignChainId, pair.foreignGateway, chain);
    const seen = new Set<string>();
    return pairRates.targets.map((targetConfig) => {
      const target = resolveTarget(pair, targetConfig, chains);
      const name = rateTargetName(target);
      if (seen.has(name)) throw new Error(`rates.pairs.${pair.id}.targets: ${name} is listed twice`);
      seen.add(name);
      return new RateLoop(ports, { pair, rates, target, priceOracle, config });
    });
  });
};

function resolveTarget(
  pair: PairConfig,
  targetConfig: RateTargetConfig,
  chains: readonly ChainConfig[]
): GatewayRateTarget {
  const path = `rates.pairs.${pair.id}.targets`;
  if (targetConfig === "homeNative") {
    // [L2]: when both chains have the same native currency, homeNativeRate is fixed at 1e18 (RATE_PRECISION). A loop
    // would price that currency in the quote (ETH/USD on Base) and ratchet the rate away from 1e18 every cooldown.
    const nativeOf = (chainId: number) => chains.find((chain) => chain.id === chainId)?.nativeSymbol.toUpperCase();
    const foreign = nativeOf(pair.foreignChainId);
    if (foreign === nativeOf(pair.homeChainId)) {
      throw new Error(
        `${path}: homeNative is fixed at 1e18 because the foreign and home chains share the native currency ` +
          `${foreign}; remove it (the governor keeps homeNativeRate at 1e18)`
      );
    }
    return { kind: "homeNative" };
  }
  const asset = pair.collectedAssets.find((candidate) => candidate.symbol === targetConfig.token);
  if (!asset) {
    const known = pair.collectedAssets.map((candidate) => candidate.symbol).join(", ");
    throw new Error(`${path}: token ${targetConfig.token} is not one of the pair's collectedAssets (${known})`);
  }
  if (isNative(asset)) {
    throw new Error(`${path}: ${asset.symbol} is the native currency; use "homeNative" or a token`);
  }
  return { kind: "token", asset };
}
