import { describe, expect, it } from "vitest";
import { exampleConfig, FakeChainClient, makeFakePorts } from "../testing";
import { aggregate, median } from "./aggregator";
import { createPriceOracle } from "./index";
import type { ProviderObservation } from "./providers/types";

const E18 = 10n ** 18n;
const AT = new Date("2026-01-01T00:00:00Z");
const policy = { minSources: 3, maxSpreadBps: 200 };

function fresh(source: string, price: bigint, at = AT, family = source): ProviderObservation {
  return { kind: "price", source, family, base: "ETH", priceE18: price, observedAt: at };
}

describe("aggregate", () => {
  it("returns the median of three fresh observations", () => {
    const result = aggregate(
      "ETH",
      [fresh("a", 3010n * E18), fresh("b", 3000n * E18, new Date(AT.getTime() - 60_000)), fresh("c", 3020n * E18)],
      policy
    );
    expect(result).toMatchObject({ kind: "price", base: "ETH", priceE18: 3010n * E18, spreadBps: 34 });
    expect(result.kind === "price" && result.observations.map((o) => o.source)).toEqual(["a", "b", "c"]);
    expect(result.kind === "price" && result.at).toEqual(new Date(AT.getTime() - 60_000));
  });

  it("averages the two middle values of an even count", () => {
    expect(median([4n, 1n, 3n, 2n])).toBe(2n);
    expect(median([10n, 20n, 30n, 40n])).toBe(25n);
  });

  it("refuses two fresh observations when three are required", () => {
    const result = aggregate("ETH", [fresh("a", 3000n * E18), fresh("b", 3001n * E18)], policy);
    expect(result).toMatchObject({ kind: "unavailable", reason: "insufficient-sources" });
  });

  it("excludes a stale observation from the median", () => {
    const stale: ProviderObservation = {
      kind: "stale",
      source: "old",
      family: "old",
      base: "ETH",
      priceE18: 1000n * E18,
      observedAt: new Date(AT.getTime() - 86_400_000),
      detail: "updated 86400s ago",
    };
    const result = aggregate(
      "ETH",
      [fresh("a", 3000n * E18), stale, fresh("b", 3010n * E18), fresh("c", 3020n * E18)],
      policy
    );
    expect(result).toMatchObject({ kind: "price", priceE18: 3010n * E18 });
    expect(result.kind === "price" && result.observations.map((o) => o.source)).not.toContain("old");

    const short = aggregate("ETH", [fresh("a", 3000n * E18), stale, fresh("b", 3010n * E18)], policy);
    expect(short).toMatchObject({ kind: "unavailable", reason: "stale" });
    expect(short.kind === "unavailable" && short.detail).toContain("old: updated 86400s ago");
  });

  it("counts a source family once toward minSources however many feeds it contributes", () => {
    const chainlink = (chain: string, price: bigint) => fresh(`chainlink:${chain}`, price, AT, "chainlink");
    const twoFamilies = aggregate(
      "ETH",
      [chainlink("arbitrum", 3000n * E18), chainlink("base", 3001n * E18), fresh("coingecko", 3002n * E18)],
      policy
    );
    expect(twoFamilies).toMatchObject({ kind: "unavailable", reason: "insufficient-sources" });
    expect(twoFamilies.kind === "unavailable" && twoFamilies.detail).toContain(
      "2 fresh source families of 3 required [chainlink, coingecko]"
    );

    // with a third family the price is the median of the family values: a bad Chainlink value carried by two
    // feeds is one vote, not two (the per-observation median would be 3151)
    const lenient = { minSources: 3, maxSpreadBps: 1500 };
    const result = aggregate(
      "ETH",
      [
        chainlink("arbitrum", 3300n * E18),
        chainlink("base", 3300n * E18),
        fresh("coingecko", 3000n * E18),
        fresh("pyth", 3002n * E18),
      ],
      lenient
    );
    expect(result).toMatchObject({ kind: "price", priceE18: 3002n * E18 });
    expect(result.kind === "price" && result.observations).toHaveLength(4);
    // and under the default spread the bad family is refused, never averaged in
    expect(
      aggregate(
        "ETH",
        [
          chainlink("arbitrum", 3300n * E18),
          chainlink("base", 3300n * E18),
          fresh("coingecko", 3000n * E18),
          fresh("pyth", 3002n * E18),
        ],
        policy
      )
    ).toMatchObject({ kind: "unavailable", reason: "disagreement" });
  });

  it("gives error when failures leave too few fresh observations", () => {
    const failed: ProviderObservation = { kind: "error", source: "x", family: "x", base: "ETH", detail: "HTTP 500" };
    expect(aggregate("ETH", [fresh("a", 3000n * E18), fresh("b", 3000n * E18), failed], policy)).toMatchObject({
      kind: "unavailable",
      reason: "error",
    });
  });

  it("refuses with disagreement when one observation deviates more than maxSpreadBps", () => {
    const result = aggregate(
      "ETH",
      [fresh("a", 3000n * E18), fresh("b", 3010n * E18), fresh("c", 3100n * E18)],
      policy
    );
    expect(result).toMatchObject({ kind: "unavailable", reason: "disagreement" });
    // exactly at the threshold still agrees
    const edge = aggregate("ETH", [fresh("a", 98n * E18), fresh("b", 100n * E18), fresh("c", 102n * E18)], policy);
    expect(edge).toMatchObject({ kind: "price", priceE18: 100n * E18, spreadBps: 200 });
  });

  it("returns a USDC price away from 1 USD as observed", () => {
    const usdc = (source: string, price: bigint): ProviderObservation => ({
      kind: "price",
      source,
      family: source,
      base: "USDC",
      priceE18: price,
      observedAt: AT,
    });
    const result = aggregate(
      "USDC",
      [usdc("a", 950_000_000_000_000_000n), usdc("b", 948_000_000_000_000_000n), usdc("c", 951_000_000_000_000_000n)],
      policy
    );
    expect(result).toMatchObject({ kind: "price", base: "USDC", priceE18: 950_000_000_000_000_000n });
  });
});

describe("createPriceOracle", () => {
  it("performs no I/O when no provider is enabled", async () => {
    const ports = makeFakePorts();
    let reads = 0;
    for (const chain of ports.chains.values()) chain.onRead(() => (reads++, false), null);
    ports.fetch = async () => {
      throw new Error("network");
    };
    const result = await createPriceOracle(ports).price("ETH");
    expect(result).toMatchObject({ kind: "unavailable", reason: "insufficient-sources" });
    expect(reads).toBe(0);
  });

  it("aggregates the configured providers end to end", async () => {
    const feed = (n: number) => `0x00000000000000000000000000000000000000f${n}` as const;
    const config = exampleConfig({
      rates: {
        providers: [
          { id: "chainlink", chainId: 1003, feeds: { ETH: feed(1) } },
          { id: "chainlink", chainId: 1002, feeds: { ETH: feed(2) } },
          { id: "coingecko" },
          { id: "coingecko", source: "disabled", enabled: false },
        ],
      },
    });
    const ports = makeFakePorts(config);
    const now = BigInt(AT.getTime() / 1000);
    const script = (chain: FakeChainClient, answer: bigint) =>
      chain
        .onRead((c) => c.functionName === "decimals", 8)
        .onRead((c) => c.functionName === "latestRoundData", [1n, answer, now, now, 1n]);
    script(ports.chains.get(1003)!, 300_000_000_000n);
    script(ports.chains.get(1002)!, 301_000_000_000n);
    let calls = 0;
    ports.fetch = async () => {
      calls += 1;
      return new Response(JSON.stringify({ ethereum: { usd: 3005, last_updated_at: Number(now) } }));
    };
    // two Chainlink feeds and CoinGecko are two families: refused under the default minSources 3
    const refused = await createPriceOracle(ports).price("ETH");
    expect(refused).toMatchObject({ kind: "unavailable", reason: "insufficient-sources" });

    calls = 0;
    const twoRequired = { ...ports, config: { ...config, rates: { ...config.rates, minSources: 2 } } };
    const result = await createPriceOracle(twoRequired).price("ETH");
    expect(result).toMatchObject({ kind: "price", priceE18: 3005n * E18 });
    expect(result.kind === "price" && result.observations.map((o) => o.source).sort()).toEqual([
      "chainlink:1002",
      "chainlink:1003",
      "coingecko",
    ]);
    expect(calls).toBe(1);
  });

  it("rejects a Chainlink provider on a chain outside the topology", () => {
    const config = exampleConfig({
      rates: {
        providers: [{ id: "chainlink", chainId: 999, feeds: { ETH: "0x00000000000000000000000000000000000000f1" } }],
      },
    });
    expect(() => createPriceOracle(makeFakePorts(config))).toThrow(/chain 999/);
  });
});
