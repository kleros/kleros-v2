import type { CorePorts, PriceOracle, PriceResult } from "../ports";
import { aggregate } from "./aggregator";
import { providerSource, type RatesConfig } from "./config";
import { ChainlinkProvider } from "./providers/chainlink";
import { CoingeckoProvider } from "./providers/coingecko";
import { errorDetail, type PriceProvider, type ProviderObservation } from "./providers/types";

/** Builds the enabled providers. A provider on a chain without a client is a configuration error. */
export function buildProviders(
  config: RatesConfig,
  ports: Pick<CorePorts, "chains" | "clock" | "fetch" | "logger">,
  env: NodeJS.ProcessEnv = process.env
): PriceProvider[] {
  const providers: PriceProvider[] = [];
  for (const provider of config.providers) {
    if (!provider.enabled) continue;
    const source = providerSource(provider);
    const freshness = provider.freshnessSeconds ?? config.freshnessSeconds;
    switch (provider.id) {
      case "chainlink": {
        const chain = ports.chains.get(provider.chainId);
        if (!chain) throw new Error(`rates: price source ${source} reads chain ${provider.chainId}, not in topology`);
        providers.push(new ChainlinkProvider(source, provider, freshness, chain, ports.clock));
        break;
      }
      case "coingecko":
        providers.push(
          new CoingeckoProvider(source, provider, freshness, {
            fetch: ports.fetch,
            clock: ports.clock,
            logger: ports.logger,
            env,
          })
        );
        break;
    }
  }
  return providers;
}

/** Asks every provider for the symbol and aggregates. With no provider enabled it answers without any I/O. */
export class AggregatedPriceOracle implements PriceOracle {
  constructor(
    private readonly providers: readonly PriceProvider[],
    private readonly config: Pick<RatesConfig, "minSources" | "maxSpreadBps">
  ) {}

  async price(base: string): Promise<PriceResult> {
    if (this.providers.length === 0) {
      return { kind: "unavailable", base, reason: "insufficient-sources", detail: "no price provider enabled" };
    }
    const observations = await Promise.all(
      this.providers.map((provider) =>
        provider.observe(base).catch(
          (error: unknown): ProviderObservation => ({
            kind: "error",
            source: provider.source,
            family: provider.family,
            base,
            detail: errorDetail(error),
          })
        )
      )
    );
    return aggregate(base, observations, this.config);
  }
}
