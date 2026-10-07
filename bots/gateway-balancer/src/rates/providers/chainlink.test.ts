import { describe, expect, it } from "vitest";
import type { Address } from "../../domain";
import { FakeChainClient, FakeClock } from "../../testing";
import { ChainlinkProvider } from "./chainlink";

const ETH_FEED: Address = "0x00000000000000000000000000000000000000e1";
const NOW_S = 1767225600n; // FakeClock's default time, 2026-01-01T00:00:00Z

function setup(round: { answer: bigint; updatedAt: bigint }, decimals = 8) {
  const chain = new FakeChainClient(1003);
  chain
    .onRead((c) => c.address === ETH_FEED && c.functionName === "decimals", decimals)
    .onRead(
      (c) => c.address === ETH_FEED && c.functionName === "latestRoundData",
      () => [7n, round.answer, round.updatedAt, round.updatedAt, 7n]
    );
  const provider = new ChainlinkProvider("chainlink:1003", { feeds: { ETH: ETH_FEED } }, 3600, chain, new FakeClock());
  return { chain, provider };
}

describe("ChainlinkProvider", () => {
  it("scales latestRoundData at the feed's decimals to 1e18", async () => {
    const { provider } = setup({ answer: 245_632_000_000n, updatedAt: NOW_S - 60n });
    const observation = await provider.observe("ETH");
    expect(observation).toEqual({
      kind: "price",
      source: "chainlink:1003",
      family: "chainlink",
      base: "ETH",
      priceE18: 2456_320_000_000_000_000_000n,
      observedAt: new Date(Number(NOW_S - 60n) * 1000),
    });
  });

  it("handles feeds with more than 18 decimals", async () => {
    const { provider } = setup({ answer: 3000n * 10n ** 20n, updatedAt: NOW_S }, 20);
    const observation = await provider.observe("ETH");
    expect(observation.kind === "price" && observation.priceE18).toBe(3000n * 10n ** 18n);
  });

  it("reports an updatedAt older than the freshness limit as stale", async () => {
    const { provider } = setup({ answer: 245_632_000_000n, updatedAt: NOW_S - 3601n });
    const observation = await provider.observe("ETH");
    expect(observation.kind).toBe("stale");
    expect(observation.kind === "stale" && observation.priceE18).toBe(2456_320_000_000_000_000_000n);
  });

  it("applies a feed's own freshnessSeconds over the provider's", async () => {
    const USDC_FEED: Address = "0x00000000000000000000000000000000000000e2";
    const chain = new FakeChainClient(1003);
    const dayAndAMinute = NOW_S - 86_460n;
    chain
      .onRead((c) => c.functionName === "decimals", 8)
      .onRead(
        (c) => c.functionName === "latestRoundData",
        () => [7n, 100_000_000n, dayAndAMinute, dayAndAMinute, 7n]
      );
    const provider = new ChainlinkProvider(
      "chainlink:1003",
      { feeds: { ETH: ETH_FEED, USDC: { address: USDC_FEED, freshnessSeconds: 90_000 } } },
      3900,
      chain,
      new FakeClock()
    );
    // a USDC/USD answer a day old is within its 24 h heartbeat plus margin
    expect(await provider.observe("USDC")).toMatchObject({ kind: "price", priceE18: 10n ** 18n });
    // the same age on a feed without its own limit is stale under the provider's 3900 s
    expect(await provider.observe("ETH")).toMatchObject({ kind: "stale", detail: expect.stringContaining("3900s") });
    // past its own limit the USDC feed is stale too
    chain.reads.unshift({
      match: (c) => c.functionName === "latestRoundData",
      result: [8n, 100_000_000n, NOW_S - 90_001n, NOW_S - 90_001n, 8n],
    });
    expect(await provider.observe("USDC")).toMatchObject({ kind: "stale", detail: expect.stringContaining("90000s") });
  });

  it("reports a never-updated round as stale", async () => {
    const { provider } = setup({ answer: 245_632_000_000n, updatedAt: 0n });
    expect((await provider.observe("ETH")).kind).toBe("stale");
  });

  it("reports a read error as an error observation instead of throwing", async () => {
    const chain = new FakeChainClient(1003);
    chain.onRead(
      () => true,
      () => {
        throw new Error("execution reverted revertData=none");
      }
    );
    const provider = new ChainlinkProvider(
      "chainlink:1003",
      { feeds: { ETH: ETH_FEED } },
      3600,
      chain,
      new FakeClock()
    );
    const observation = await provider.observe("ETH");
    expect(observation).toMatchObject({ kind: "error", source: "chainlink:1003", base: "ETH" });
    expect(observation.kind === "error" && observation.detail).toContain("execution reverted");
  });

  it("reports a non-positive answer and an unconfigured symbol as errors", async () => {
    const { provider } = setup({ answer: 0n, updatedAt: NOW_S });
    expect((await provider.observe("ETH")).kind).toBe("error");
    expect(await provider.observe("USDC")).toMatchObject({
      kind: "error",
      detail: "no Chainlink feed configured for USDC",
    });
  });

  it("reads decimals once per feed", async () => {
    const { chain, provider } = setup({ answer: 245_632_000_000n, updatedAt: NOW_S });
    let decimalsReads = 0;
    chain.reads.unshift({
      match: (c) => {
        if (c.functionName === "decimals") decimalsReads += 1;
        return false;
      },
      result: null,
    });
    await provider.observe("ETH");
    await provider.observe("ETH");
    expect(decimalsReads).toBe(1);
  });
});
