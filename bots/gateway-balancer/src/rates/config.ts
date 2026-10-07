import { z } from "zod";

/**
 * Owned by the rates lane: price providers, freshness, disagreement threshold, minimum sources, update trigger,
 * rejection handling. `"rates": {}` parses to the defaults with no provider enabled (no network I/O).
 * The address regex is local: importing `config/schema` here would be a circular import.
 */

const address = z
  .string()
  .regex(/^0x[0-9a-fA-F]{40}$/, "expected a 0x-prefixed 20-byte hex address")
  .transform((value) => value as `0x${string}`);

/** Price symbols the oracle answers for ("ETH", "USDC"). */
const symbol = z.string().regex(/^[A-Z0-9]+$/, "expected an upper-case symbol such as ETH or USDC");

/**
 * A Chainlink feed: its address, or the address with its own freshness limit. Feeds have different heartbeats
 * (USDC/USD updates every 24 h, ETH/USD far more often), so one limit for every feed marks the slow ones stale.
 */
const chainlinkFeedSchema = z.union([
  address,
  z
    .object({
      address,
      /** Seconds after `updatedAt` the answer is stale: the feed's heartbeat plus a margin. */
      freshnessSeconds: z.number().int().positive().optional(),
    })
    .strict(),
]);

const chainlinkProviderSchema = z
  .object({
    id: z.literal("chainlink"),
    /** Label of the observations; defaults to `chainlink:<chainId>`. Must be unique across providers. */
    source: z.string().min(1).optional(),
    enabled: z.boolean().default(true),
    /** A topology chain whose `ChainClient` reads the aggregators. */
    chainId: z.number().int().positive(),
    /**
     * USD aggregator per symbol, e.g. `{ "ETH": <ETH/USD feed>, "USDC": { "address": <USDC/USD feed>,
     * "freshnessSeconds": 90000 } }`.
     */
    feeds: z.record(symbol, chainlinkFeedSchema).refine((feeds) => Object.keys(feeds).length > 0, "at least one feed"),
    /** Overrides the section's `freshnessSeconds` for feeds without their own (match the feed's heartbeat). */
    freshnessSeconds: z.number().int().positive().optional(),
  })
  .strict();

/**
 * Environment variables holding the bot's own secrets or its configuration path. An `apiKeyEnv` naming one would send
 * that value to the price provider as an API key. A collision with a topology `rpcUrlEnv` is checked by the platform
 * loader, which sees the whole composed configuration.
 */
export const RESERVED_ENV_NAMES: readonly string[] = ["BALANCER_PRIVATE_KEY", "GATEWAY_BALANCER_CONFIG"];

const apiKeyEnvSchema = z
  .string()
  .min(1)
  .refine((name) => !RESERVED_ENV_NAMES.includes(name), {
    message: "names a reserved variable (the private key or the configuration path), not an API key",
  });

const coingeckoProviderSchema = z
  .object({
    id: z.literal("coingecko"),
    source: z.string().min(1).optional(),
    enabled: z.boolean().default(true),
    /** `https://pro-api.coingecko.com` with `apiKeyHeader: "x-cg-pro-api-key"` for a paid plan. */
    baseUrl: z.string().url().default("https://api.coingecko.com"),
    /** Name of the environment variable holding the API key; no key is sent when absent or empty. */
    apiKeyEnv: apiKeyEnvSchema.optional(),
    apiKeyHeader: z.enum(["x-cg-demo-api-key", "x-cg-pro-api-key"]).default("x-cg-demo-api-key"),
    /** CoinGecko coin id per symbol. */
    coinIds: z.record(symbol, z.string().min(1)).default({ ETH: "ethereum", USDC: "usd-coin" }),
    freshnessSeconds: z.number().int().positive().optional(),
  })
  .strict();

/** The provider seam: one entry per source; an unknown `id` is a configuration error. Pyth is deferred. */
export const priceProviderConfigSchema = z.discriminatedUnion("id", [chainlinkProviderSchema, coingeckoProviderSchema]);

const pairRatesSchema = z
  .object({
    /**
     * The symbol the rate is quoted in. Defaults to the pair's `rateCurrency`. "USD" uses ETH/USD as is; any
     * other symbol (e.g. "USDC") divides ETH/USD by that symbol's USD price.
     */
    quoteSymbol: symbol.optional(),
  })
  .strict();

export const ratesConfigSchema = z
  .object({
    providers: z.array(priceProviderConfigSchema).default([]),
    /**
     * Independent source families (Chainlink, CoinGecko, later Pyth) with a fresh observation required for a
     * price. Several feeds of one family (Chainlink on two chains) count once: they share one oracle network.
     */
    minSources: z.number().int().min(1).default(3),
    /** Refuse with `disagreement` when any observation is further than this from the median. */
    maxSpreadBps: z.number().int().min(0).max(10_000).default(200),
    /** An observation older than this is stale (per provider override: `freshnessSeconds`). */
    freshnessSeconds: z.number().int().positive().default(3600),
    /** Propose an update when the market rate differs from the current rate by at least this. */
    updateTriggerBps: z.number().int().min(1).max(10_000).default(500),
    /** Wait after a `cooldown` rejection before the next attempt (set to the contract's minimum interval). */
    cooldownSeconds: z.number().int().positive().default(3600),
    /** Wait after any other rejection (`max-change`, `out-of-bounds`, `unauthorized`, `unknown`). */
    rejectionRetrySeconds: z.number().int().positive().default(3600),
    /** Consecutive rejections of one pair before one `critical`. */
    rejectionsBeforeCritical: z.number().int().min(1).default(3),
    /** Consecutive ticks without a price before one `warning`. */
    priceMissesBeforeWarning: z.number().int().min(1).default(3),
    /** A price unavailable for longer than this raises one `critical`. */
    priceUnavailableCriticalSeconds: z.number().int().positive().default(21_600),
    pairs: z.record(z.string().min(1), pairRatesSchema).default({}),
  })
  .strict()
  .superRefine((config, ctx) => {
    const seen = new Set<string>();
    config.providers.forEach((provider, index) => {
      const source = providerSource(provider);
      if (seen.has(source)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["providers", index, "source"],
          message: `duplicate price source ${source}`,
        });
      }
      seen.add(source);
    });
  })
  .default({});

export type RatesConfig = z.infer<typeof ratesConfigSchema>;
export type PriceProviderConfig = z.infer<typeof priceProviderConfigSchema>;
export type ChainlinkProviderConfig = z.infer<typeof chainlinkProviderSchema>;
export type CoingeckoProviderConfig = z.infer<typeof coingeckoProviderSchema>;
export type ChainlinkFeedConfig = z.infer<typeof chainlinkFeedSchema>;

export function feedAddress(feed: ChainlinkFeedConfig): `0x${string}` {
  return typeof feed === "string" ? feed : feed.address;
}

export function providerSource(provider: PriceProviderConfig): string {
  if (provider.source) return provider.source;
  return provider.id === "chainlink" ? `chainlink:${provider.chainId}` : provider.id;
}
