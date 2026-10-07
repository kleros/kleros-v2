import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { exampleConfig, FakeClock, FakeLogger } from "../../testing";
import { ratesConfigSchema } from "../config";
import { CoingeckoProvider, decimalToE18 } from "./coingecko";

const FIXTURE = readFileSync(new URL("../fixtures/coingecko-simple-price.json", import.meta.url), "utf8");
const SECRET = "CG-test-key-0123456789";
/** Shortly after the recording (2026-10-06): the recorded timestamps are fresh. */
const RECORDED_NOW = new Date(1791314600 * 1000);

type Call = { url: string; headers: Record<string, string> };

function stubFetch(respond: (url: URL) => Response | Promise<Response>, calls: Call[] = []): typeof globalThis.fetch {
  return async (input, init) => {
    const url = new URL(String(input));
    calls.push({ url: url.toString(), headers: { ...(init?.headers as Record<string, string>) } });
    return respond(url);
  };
}

/** Serves only the requested ids of the fixture, as CoinGecko does. */
function fixtureResponse(url: URL): Response {
  const all = JSON.parse(FIXTURE) as Record<string, unknown>;
  const ids = (url.searchParams.get("ids") ?? "").split(",");
  return new Response(JSON.stringify(Object.fromEntries(ids.map((id) => [id, all[id]]))), { status: 200 });
}

function provider(
  fetch: typeof globalThis.fetch,
  options: { apiKeyEnv?: string; env?: NodeJS.ProcessEnv; logger?: FakeLogger } = {}
) {
  const config = ratesConfigSchema.parse({
    providers: [{ id: "coingecko", ...(options.apiKeyEnv ? { apiKeyEnv: options.apiKeyEnv } : {}) }],
  }).providers[0]!;
  if (config.id !== "coingecko") throw new Error("unexpected provider");
  return new CoingeckoProvider("coingecko", config, 3600, {
    fetch,
    clock: new FakeClock(RECORDED_NOW),
    logger: options.logger ?? new FakeLogger(),
    env: options.env ?? {},
  });
}

describe("CoingeckoProvider", () => {
  it("parses the recorded response for ETH and USDC", async () => {
    const calls: Call[] = [];
    const cg = provider(stubFetch(fixtureResponse, calls));
    expect(await cg.observe("ETH")).toEqual({
      kind: "price",
      source: "coingecko",
      base: "ETH",
      family: "coingecko",
      priceE18: 2685_050_000_000_000_000_000n,
      observedAt: new Date(1791314540 * 1000),
    });
    const usdc = await cg.observe("USDC");
    expect(usdc).toMatchObject({ kind: "price", base: "USDC", priceE18: 999_934_000_000_000_000n });
    expect(usdc.kind === "price" && usdc.observedAt).toEqual(new Date(1791314550 * 1000));
    const url = new URL(calls[0]!.url);
    expect(url.origin + url.pathname).toBe("https://api.coingecko.com/api/v3/simple/price");
    expect(url.searchParams.get("ids")).toBe("ethereum");
    expect(url.searchParams.get("vs_currencies")).toBe("usd");
    expect(url.searchParams.get("include_last_updated_at")).toBe("true");
    expect(new URL(calls[1]!.url).searchParams.get("ids")).toBe("usd-coin");
  });

  it("reports an old last_updated_at as stale", async () => {
    const body = JSON.stringify({ ethereum: { usd: 2400, last_updated_at: 1791314600 - 7200 } });
    const observation = await provider(stubFetch(() => new Response(body))).observe("ETH");
    expect(observation.kind).toBe("stale");
  });

  it("reports an HTTP error as an error observation", async () => {
    const observation = await provider(stubFetch(() => new Response("rate limited", { status: 429 }))).observe("ETH");
    expect(observation).toEqual({
      kind: "error",
      source: "coingecko",
      base: "ETH",
      family: "coingecko",
      detail: "HTTP 429 from CoinGecko",
    });
  });

  it.each([
    ["not JSON", "<html>"],
    ["no entry", "{}"],
    ["a string price", JSON.stringify({ ethereum: { usd: "2400", last_updated_at: 1767225540 } })],
    ["a zero price", JSON.stringify({ ethereum: { usd: 0, last_updated_at: 1767225540 } })],
    ["no timestamp", JSON.stringify({ ethereum: { usd: 2400 } })],
    ["null", "null"],
  ])("reports a malformed body (%s) as an error observation", async (_, body) => {
    const observation = await provider(stubFetch(() => new Response(body))).observe("ETH");
    expect(observation.kind).toBe("error");
    expect(observation.kind === "error" && observation.detail).toMatch(/^malformed CoinGecko response/);
  });

  it("sends the API key only when configured and present, and never logs it", async () => {
    const withKey: Call[] = [];
    const logger = new FakeLogger();
    await provider(stubFetch(fixtureResponse, withKey), {
      apiKeyEnv: "COINGECKO_API_KEY",
      env: { COINGECKO_API_KEY: SECRET },
      logger,
    }).observe("ETH");
    expect(withKey[0]!.headers["x-cg-demo-api-key"]).toBe(SECRET);
    expect(withKey[0]!.url).not.toContain(SECRET);

    const unset: Call[] = [];
    await provider(stubFetch(fixtureResponse, unset), { apiKeyEnv: "COINGECKO_API_KEY", env: {} }).observe("ETH");
    expect(Object.keys(unset[0]!.headers)).toEqual(["accept"]);

    const unconfigured: Call[] = [];
    await provider(stubFetch(fixtureResponse, unconfigured), { env: { COINGECKO_API_KEY: SECRET } }).observe("ETH");
    expect(Object.keys(unconfigured[0]!.headers)).toEqual(["accept"]);

    const failing = provider(
      async () => {
        throw new Error(`connect failed with header ${SECRET}`);
      },
      { apiKeyEnv: "COINGECKO_API_KEY", env: { COINGECKO_API_KEY: SECRET }, logger }
    );
    const observation = await failing.observe("ETH");
    expect(observation.kind).toBe("error");
    expect(JSON.stringify(observation)).not.toContain(SECRET);
    expect(logger.entries.length).toBeGreaterThan(0);
    expect(JSON.stringify(logger.entries)).not.toContain(SECRET);
  });

  it("redacts the key before truncating, also when the key straddles the 300-character boundary", async () => {
    const logger = new FakeLogger();
    // The key starts 5 characters before the cut: truncating first would leave "CG-te" in the detail.
    const message = `${"x".repeat(295)}${SECRET} trailing text`;
    const failing = provider(
      async () => {
        throw new Error(message);
      },
      { apiKeyEnv: "COINGECKO_API_KEY", env: { COINGECKO_API_KEY: SECRET }, logger }
    );
    const observation = await failing.observe("ETH");
    expect(observation.kind).toBe("error");
    const detail = observation.kind === "error" ? observation.detail : "";
    expect(detail).toBe(`${"x".repeat(295)}[redacted] trailing text`.slice(0, 300) + "…");
    expect(detail).not.toContain(SECRET.slice(0, 5));
    expect(JSON.stringify(logger.entries)).not.toContain(SECRET.slice(0, 5));
  });

  it("fails configuration on an unknown provider id", () => {
    expect(ratesConfigSchema.safeParse({ providers: [{ id: "pyth" }] }).success).toBe(false);
    expect(() => exampleConfig({ rates: { providers: [{ id: "pyth" }] } as never })).toThrow();
  });

  it("fails configuration on duplicate source labels and unknown fields", () => {
    expect(ratesConfigSchema.safeParse({ providers: [{ id: "coingecko" }, { id: "coingecko" }] }).success).toBe(false);
    expect(ratesConfigSchema.safeParse({ providers: [{ id: "coingecko", apikey: "x" }] }).success).toBe(false);
  });
});

describe("decimalToE18", () => {
  it.each([
    ["1", 10n ** 18n],
    ["0.99981234", 999_812_340_000_000_000n],
    ["2456.3187420931", 2456_318_742_093_100_000_000n],
    ["1e-7", 100_000_000_000n],
    ["1.5e3", 1500n * 10n ** 18n],
    ["0.1234567890123456789", 123_456_789_012_345_678n],
  ])("%s", (text, expected) => {
    expect(decimalToE18(text)).toBe(expected);
  });
});
