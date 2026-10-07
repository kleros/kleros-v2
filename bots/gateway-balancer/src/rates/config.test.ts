import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import type { ChainClient } from "../ports";
import { FakeChainClient, FakeClock, FakeLogger } from "../testing";
import { feedAddress, ratesConfigSchema, RESERVED_ENV_NAMES } from "./config";
import { AggregatedPriceOracle, buildProviders } from "./oracle";

const NOW_S = 1767225600n; // FakeClock's default time

function example() {
  return ratesConfigSchema.parse(
    JSON.parse(readFileSync(new URL("./example-config.json", import.meta.url), "utf8")) as unknown
  );
}

/** The example section over fake Chainlink chains (every feed answered `ageSeconds` ago) and a CoinGecko stub. */
function exampleOracle(ageSeconds: bigint, config = example()) {
  const updatedAt = NOW_S - ageSeconds;
  const chains = new Map<number, ChainClient>();
  for (const chainId of [42161, 8453]) {
    chains.set(
      chainId,
      new FakeChainClient(chainId)
        .onRead((c) => c.functionName === "decimals", 8)
        .onRead(
          (c) => c.functionName === "latestRoundData",
          (c: { address: string }) => {
            const usdc = Object.values(config.providers).some(
              (p) => p.id === "chainlink" && p.feeds.USDC && feedAddress(p.feeds.USDC) === c.address
            );
            return [1n, usdc ? 100_000_000n : 300_000_000_000n, updatedAt, updatedAt, 1n];
          }
        )
    );
  }
  const fetch: typeof globalThis.fetch = async (input) => {
    const ids = new URL(String(input)).searchParams.get("ids");
    const usd = ids === "usd-coin" ? 1 : 3000;
    return new Response(JSON.stringify({ [ids!]: { usd, last_updated_at: Number(NOW_S) - 60 } }));
  };
  const ports = { chains, clock: new FakeClock(), fetch, logger: new FakeLogger() };
  return (minSources: number) =>
    new AggregatedPriceOracle(buildProviders(config, ports as never, {}), { ...config, minSources });
}

describe("ratesConfigSchema", () => {
  it("parses an empty section to defaults with no provider", () => {
    expect(ratesConfigSchema.parse({})).toMatchObject({
      providers: [],
      minSources: 3,
      updateTriggerBps: 500,
      pairs: {},
    });
    expect(ratesConfigSchema.parse(undefined).providers).toEqual([]);
  });

  it("parses the documented example section", () => {
    const example = JSON.parse(readFileSync(new URL("./example-config.json", import.meta.url), "utf8")) as unknown;
    const config = ratesConfigSchema.parse(example);
    expect(config.providers.map((p) => p.id)).toEqual(["chainlink", "chainlink", "coingecko"]);
  });

  it("gives every example Chainlink feed its own freshness, USDC/USD at least its 24 h heartbeat plus margin", () => {
    for (const provider of example().providers) {
      if (provider.id !== "chainlink") continue;
      for (const [symbol, feed] of Object.entries(provider.feeds)) {
        expect(typeof feed === "object" && feed.freshnessSeconds, `${provider.source} ${symbol}`).toBeTypeOf("number");
        if (symbol === "USDC" && typeof feed === "object") expect(feed.freshnessSeconds).toBeGreaterThan(86_400);
      }
    }
  });

  it("keeps the example USDC/USD feeds fresh 23 h after an update while ETH/USD that old is stale", async () => {
    const oracle = exampleOracle(23n * 3600n)(2);
    expect(await oracle.price("USDC")).toMatchObject({ kind: "price", priceE18: 10n ** 18n });
    expect(await oracle.price("ETH")).toMatchObject({ kind: "unavailable", reason: "stale" });
  });

  it("counts the two example Chainlink entries as one family, short of minSources 3", async () => {
    const oracle = exampleOracle(60n);
    const refused = await oracle(3).price("ETH");
    expect(refused).toMatchObject({ kind: "unavailable", reason: "insufficient-sources" });
    expect(refused.kind === "unavailable" && refused.detail).toContain("2 fresh source families of 3 required");
    expect(example().minSources).toBe(3);
    expect(await oracle(2).price("ETH")).toMatchObject({ kind: "price", priceE18: 3000n * 10n ** 18n });
  });

  it.each(["BALANCER_PRIVATE_KEY", "GATEWAY_BALANCER_CONFIG"])(
    "rejects an apiKeyEnv naming the reserved %s with its JSON path",
    (name) => {
      expect(RESERVED_ENV_NAMES).toContain(name);
      const providers = [{ id: "chainlink", chainId: 42161, feeds: { ETH: "0x" + "1".repeat(40) } }];
      const result = ratesConfigSchema.safeParse({ providers: [...providers, { id: "coingecko", apiKeyEnv: name }] });
      expect(result.success).toBe(false);
      const issue = result.error!.issues.find((i) => i.path.join(".") === "providers.1.apiKeyEnv");
      expect(issue?.message).toContain("reserved variable");
      // Composed under `rates`, the issue path the platform loader prints is rates.providers[1].apiKeyEnv.
      const composed = z
        .object({ rates: ratesConfigSchema })
        .safeParse({ rates: { providers: [{ id: "coingecko", apiKeyEnv: name }] } });
      expect(composed.error!.issues.map((i) => i.path.join("."))).toEqual(["rates.providers.0.apiKeyEnv"]);
    }
  );

  it("accepts an ordinary apiKeyEnv", () => {
    const config = ratesConfigSchema.parse({ providers: [{ id: "coingecko", apiKeyEnv: "COINGECKO_API_KEY" }] });
    expect(config.providers[0]).toMatchObject({ apiKeyEnv: "COINGECKO_API_KEY" });
  });
});
