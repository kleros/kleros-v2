import { maxUint256 } from "viem";
import { describe, expect, it } from "vitest";
import { cloneJson, type Address, type Asset, type JsonValue } from "../domain";
import type { RouteQuote, RouteRequest } from "../ports";
import {
  EXAMPLE_ADDRESSES,
  EXAMPLE_CHAINS,
  FAKE_LIFI_DIAMOND,
  FAKE_SIGNER,
  FakeClock,
  FakeJournal,
  FakePriceOracle,
  FakeRouteProvider,
  exampleConfig,
  makeFakePorts,
  makeQuote as makeFakeQuote,
} from "../testing";
import { LifiClient } from "./client";
import { createRouteProvider, createTransfers } from "./index";
import { lifiConfigSchema, type LifiConfig } from "./config";
import { evaluateQuote } from "./policy";
import { LifiRouteProvider } from "./provider";
import { validateLifiConfig } from "./validate";
import { quoteOf, storeQuote } from "./transfers";
import {
  ASSETS,
  BASE_USDC,
  LAYERSWAP_DEPOSITORY_ETH,
  QUOTE_ROUTES,
  SIGNER,
  approvingLifiConfig,
  fixtureFetch,
  mainnetConfig,
  withBridgeCalldata,
} from "./testSupport";

const OTHER: Address = "0x00000000000000000000000000000000000000ee";
const usdc: Asset = {
  chainId: EXAMPLE_CHAINS.foreignEth,
  address: EXAMPLE_ADDRESSES.usdcOnForeignEth,
  symbol: "USDC",
  decimals: 6,
};
const eth: Asset = { chainId: EXAMPLE_CHAINS.foreignEth, address: "native", symbol: "ETH", decimals: 18 };
const homeEth: Asset = { chainId: EXAMPLE_CHAINS.home, address: "native", symbol: "ETH", decimals: 18 };

function config(overrides: Partial<LifiConfig> = {}): LifiConfig {
  return lifiConfigSchema.parse({
    allowedChains: [EXAMPLE_CHAINS.foreignEth, EXAMPLE_CHAINS.home],
    allowedTools: ["layerswap"],
    allowedAssets: [
      { chainId: EXAMPLE_CHAINS.foreignEth, address: EXAMPLE_ADDRESSES.usdcOnForeignEth },
      { chainId: EXAMPLE_CHAINS.foreignEth, address: "native" },
      { chainId: EXAMPLE_CHAINS.home, address: "native" },
    ],
    allowedTargets: [{ chainId: EXAMPLE_CHAINS.foreignEth, address: FAKE_LIFI_DIAMOND }],
    allowedSpenders: [{ chainId: EXAMPLE_CHAINS.foreignEth, address: FAKE_LIFI_DIAMOND }],
    layerSwapDepositories: [{ chainId: EXAMPLE_CHAINS.foreignEth, address: LAYERSWAP_DEPOSITORY_ETH }],
    limits: [
      {
        chainId: EXAMPLE_CHAINS.foreignEth,
        asset: EXAMPLE_ADDRESSES.usdcOnForeignEth,
        decimals: 6,
        perTransfer: "1000",
        daily: "1500",
      },
      { chainId: EXAMPLE_CHAINS.foreignEth, asset: "native", decimals: 18, perTransfer: "1", daily: "2" },
    ],
    ...overrides,
  });
}

function request(overrides: Partial<RouteRequest> = {}): RouteRequest {
  return {
    fromChainId: EXAMPLE_CHAINS.foreignEth,
    fromAsset: usdc,
    toChainId: EXAMPLE_CHAINS.home,
    toAsset: homeEth,
    amount: 500_000_000n,
    sender: FAKE_SIGNER,
    recipient: FAKE_SIGNER,
    purpose: "refill",
    ...overrides,
  };
}

/** A fake quote whose bridge step carries calldata that agrees with it (the policy decodes it). */
function makeQuote(req: RouteRequest, overrides: Partial<RouteQuote> = {}): RouteQuote {
  return withBridgeCalldata(makeFakeQuote(req, overrides), FAKE_SIGNER);
}

/** `makeQuote` stringifies its request, which cannot carry the bigint `minimumOutput`. */
function quoteFor(req: RouteRequest, overrides: Partial<RouteQuote> = {}): RouteQuote {
  return makeQuote({ ...req, minimumOutput: undefined }, overrides);
}

function check(input: { request?: RouteRequest; quote?: RouteQuote; spent?: bigint; cfg?: LifiConfig }): string[] {
  const req = input.request ?? request();
  return evaluateQuote(input.cfg ?? config(), {
    request: req,
    quote: input.quote ?? quoteFor(req),
    spentLast24h: input.spent ?? 0n,
    signer: FAKE_SIGNER,
  });
}

const kinds = (violations: string[]) => violations.map((v) => v.split(":")[0]);

describe("transaction policy", () => {
  it("approves a quote inside every allowlist and limit", () => {
    expect(check({})).toEqual([]);
    expect(check({ request: request({ fromAsset: eth, amount: 10n ** 17n }) })).toEqual([]);
  });

  it("rejects a chain outside the allowlist", () => {
    expect(kinds(check({ cfg: config({ allowedChains: [EXAMPLE_CHAINS.foreignEth] }) }))).toContain("chain");
  });

  it("rejects an asset outside the allowlist", () => {
    const violations = check({ cfg: config({ allowedAssets: [{ chainId: EXAMPLE_CHAINS.home, address: "native" }] }) });
    expect(violations).toContain(
      `asset: USDC@${EXAMPLE_CHAINS.foreignEth}:${EXAMPLE_ADDRESSES.usdcOnForeignEth} is not allowlisted`
    );
  });

  it("rejects a tool outside the allowlist", () => {
    const req = request();
    const quote = makeQuote(req, { tool: "unknown-bridge" });
    quote.steps[1]!.tool = "unknown-bridge";
    expect(check({ request: req, quote })).toEqual(["tool: unknown-bridge is not allowlisted"]);
  });

  it("rejects a target outside the allowlist", () => {
    const req = request();
    const quote = makeQuote(req);
    quote.steps[1] = { ...quote.steps[1]!, target: OTHER, tx: { ...quote.steps[1]!.tx, to: OTHER } };
    expect(check({ request: req, quote })).toEqual([
      `target: ${OTHER} on chain ${EXAMPLE_CHAINS.foreignEth} is not allowlisted`,
    ]);
  });

  it("rejects a spender outside the allowlist", () => {
    const req = request();
    const quote = makeQuote(req);
    quote.steps[0] = { ...quote.steps[0]!, spender: OTHER };
    expect(check({ request: req, quote })).toEqual([
      `spender: ${OTHER} on chain ${EXAMPLE_CHAINS.foreignEth} is not allowlisted`,
    ]);
  });

  it("rejects a recipient other than the signer", () => {
    expect(kinds(check({ request: request({ recipient: EXAMPLE_ADDRESSES.homeGatewayEth }) }))).toEqual(["recipient"]);
  });

  it("rejects a native value that differs from the input", () => {
    const req = request({ fromAsset: eth, amount: 10n ** 17n });
    const quote = makeQuote(req);
    quote.steps[0] = { ...quote.steps[0]!, tx: { ...quote.steps[0]!.tx, value: 10n ** 17n + 1n } };
    expect(check({ request: req, quote })).toEqual([
      `value: native value ${10n ** 17n + 1n} differs from the expected ${10n ** 17n}`,
    ]);
    const erc20 = makeQuote(request());
    erc20.steps[1] = { ...erc20.steps[1]!, tx: { ...erc20.steps[1]!.tx, value: 1n } };
    expect(kinds(check({ quote: erc20 }))).toEqual(["value"]);
  });

  it("rejects an unbounded approval", () => {
    const req = request();
    const unlimited = makeQuote(req);
    unlimited.steps[0] = { ...unlimited.steps[0]!, approvalAmount: maxUint256 };
    expect(kinds(check({ request: req, quote: unlimited }))).toEqual(["approval"]);
    const missing = makeQuote(req);
    missing.steps[0] = { ...missing.steps[0]!, approvalAmount: undefined };
    expect(check({ request: req, quote: missing })).toEqual(["approval: unbounded (no approval amount)"]);
  });

  it("rejects an input over the per-transfer limit, and an asset with no limit at all", () => {
    expect(kinds(check({ request: request({ amount: 1_000_000_001n }) }))).toEqual(["limit"]);
    expect(kinds(check({ cfg: config({ limits: [] }) }))).toEqual(["limit"]);
  });

  it("rejects a daily limit overrun from what was already spent", () => {
    expect(kinds(check({ spent: 1_000_000_001n }))).toEqual(["daily-limit"]);
    expect(check({ spent: 1_000_000_000n })).toEqual([]);
  });

  it("rejects a minimum output under the budget, counting the normalized fees", () => {
    const req = request({ minimumOutput: 1000n });
    expect(
      kinds(check({ request: req, quote: quoteFor(req, { minimumOutput: 900n, estimatedOutput: 950n }) }))
    ).toEqual(["budget"]);
    // The same quote passes once its fees (already in output units) bridge the gap.
    expect(
      check({
        request: req,
        quote: quoteFor(req, { minimumOutput: 990n, estimatedOutput: 1000n, feeCostsInOutput: 10n }),
      })
    ).toEqual([]);
  });

  it("lists every violation of one quote together", () => {
    const req = request({ recipient: OTHER, amount: 2_000_000_000n, minimumOutput: 10n ** 30n });
    const quote = quoteFor(req, { tool: "unknown-bridge" });
    quote.steps[0] = { ...quote.steps[0]!, spender: OTHER, approvalAmount: maxUint256 };
    quote.steps[1] = {
      ...quote.steps[1]!,
      tool: "unknown-bridge",
      target: OTHER,
      tx: { ...quote.steps[1]!.tx, to: OTHER },
    };
    const violations = check({
      request: req,
      quote,
      cfg: config({ allowedChains: [EXAMPLE_CHAINS.foreignEth] }),
      spent: 0n,
    });
    expect(new Set(kinds(violations))).toEqual(
      new Set(["chain", "tool", "target", "spender", "approval", "recipient", "limit", "daily-limit", "budget"])
    );
  });
});

type QuoteJson = {
  action: { fromToken: { address: string; decimals: number }; toToken: { address: string; decimals: number } };
  estimate: { approvalAddress?: string };
};

/** The recorded fixtures with each quote body rewritten before the client parses it. */
function rewritingFetch(rewrite: (body: QuoteJson) => void): typeof fetch {
  const inner = fixtureFetch(QUOTE_ROUTES);
  return (async (input: string | URL | Request, init?: RequestInit) => {
    const response = await inner(input, init);
    const body = (await response.json()) as QuoteJson;
    rewrite(body);
    return new Response(JSON.stringify(body), { status: response.status });
  }) as typeof fetch;
}

describe("route provider over the recorded quotes", () => {
  function provider(
    signer: Address = SIGNER,
    fetch: typeof globalThis.fetch = fixtureFetch(QUOTE_ROUTES),
    lifi: Partial<LifiConfig> = {}
  ) {
    const config = mainnetConfig(lifi);
    const clock = new FakeClock(new Date("2026-10-06T12:00:00Z"));
    const journal = new FakeJournal(() => clock.now());
    const oracle = new FakePriceOracle().set("ETH", 2700n * 10n ** 18n).set("USDC", 10n ** 18n);
    const routeProvider = new LifiRouteProvider({
      client: new LifiClient({
        fetch,
        config: config.lifi,
        chains: config.topology.chains,
      }),
      config: config.lifi,
      priceOracle: oracle,
      ledger: journal.ledger,
      clock,
      signer,
    });
    return { routeProvider, journal, clock };
  }
  const baseUsdc = (amount: bigint): RouteRequest => ({
    fromChainId: 8453,
    fromAsset: ASSETS.baseUsdc,
    toChainId: 42161,
    toAsset: ASSETS.arbEth,
    amount,
    sender: SIGNER,
    recipient: SIGNER,
    purpose: "refill",
  });

  it("approves every recorded mainnet route under the approving allowlists", async () => {
    const { routeProvider } = provider();
    expect((await routeProvider.quote(baseUsdc(100_000_000n))).kind).toBe("quote");
    const eth = await routeProvider.quote({ ...baseUsdc(5n * 10n ** 16n), fromAsset: ASSETS.baseEth });
    expect(eth.kind).toBe("quote");
    if (eth.kind === "quote") expect(eth.quote.feeCostsInOutput).toBe(127_690_000_000_000n);
    const arc = await routeProvider.quote({
      ...baseUsdc(100n * 10n ** 18n),
      fromChainId: 5042,
      fromAsset: ASSETS.arcUsdc,
    });
    expect(arc.kind).toBe("quote");
  });

  describe("continuation legs of a bridge-then-swap (decisions [L43], [L50])", () => {
    // The intermediate (Base USDC here, delivered by this operation's bridge from Arc) is allowlisted, as the operator
    // names the intermediates it accepts, but has no limit entry of its own; the recorded Base USDC -> Base ETH swap
    // stands for the continuation.
    const approving = approvingLifiConfig();
    const lifi: Partial<LifiConfig> = { limits: approving.limits.filter((l) => l.asset !== BASE_USDC) };
    const swap: RouteRequest = {
      ...baseUsdc(100_000_000n),
      toChainId: 8453,
      toAsset: ASSETS.baseEth,
    };
    const parent = { chainId: 5042, asset: ASSETS.arcUsdc, amount: 100n * 10n ** 18n, bridgeOutput: BASE_USDC };

    it("rejects the intermediate as a first leg: no limit entry", async () => {
      const result = await provider(SIGNER, undefined, lifi).routeProvider.quote(swap);
      expect(result.kind).toBe("rejected");
      if (result.kind === "rejected") expect(kinds(result.violations)).toEqual(["limit"]);
    });

    it("passes the second leg against the parent's limit entry, adding no daily spend", async () => {
      const { routeProvider, journal, clock } = provider(SIGNER, undefined, lifi);
      // Spends of the intermediate on Base and of the parent on Arc far over any daily limit: not counted again.
      for (const [chainId, asset] of [
        [8453, BASE_USDC],
        [5042, "native"],
      ] as const) {
        await journal.ledger.recordSpend({
          chainId,
          asset,
          category: "transfer",
          amount: 10n ** 30n,
          operationId: "op-x",
          at: clock.now(),
        });
      }
      const result = await routeProvider.quote(swap, { continuationOf: parent });
      expect(result).toMatchObject({ kind: "quote" });
      // The re-evaluation of the persisted quote applies the same continuation rules.
      if (result.kind === "quote")
        expect(routeProvider.recheck(swap, result.quote, { continuationOf: parent })).toEqual([]);
    });

    it("rejects a continuation whose input is not in allowedAssets (decisions [L50])", async () => {
      const { routeProvider } = provider(SIGNER, undefined, {
        ...lifi,
        allowedAssets: approving.allowedAssets.filter((a) => a.address !== BASE_USDC),
      });
      const result = await routeProvider.quote(swap, { continuationOf: parent });
      expect(result.kind).toBe("rejected");
      if (result.kind === "rejected") {
        expect(result.violations).toEqual([`asset: USDC@8453:${BASE_USDC} is not allowlisted`]);
      }
    });

    it("rejects a continuation whose input is not the declared bridge output, or with none declared", async () => {
      const { routeProvider } = provider(SIGNER, undefined, lifi);
      const other = await routeProvider.quote(swap, { continuationOf: { ...parent, bridgeOutput: "native" } });
      expect(other.kind === "rejected" && other.violations).toEqual([
        `asset: the parent bridge delivers native, not the continuation input USDC@8453:${BASE_USDC}`,
      ]);
      const none = await routeProvider.quote(swap, { continuationOf: { ...parent, bridgeOutput: null } });
      expect(none.kind === "rejected" && none.violations).toEqual([
        "asset: the parent bridge declared no output token for the continuation input",
      ]);
      // Case does not matter: the declared output is compared as an address.
      const lowerCase = await routeProvider.quote(swap, {
        continuationOf: { ...parent, bridgeOutput: BASE_USDC.toLowerCase() },
      });
      expect(lowerCase.kind).toBe("quote");
    });

    it("rejects it when the parent's entry is missing or the parent input exceeds its per-transfer limit", async () => {
      const { routeProvider } = provider(SIGNER, undefined, lifi);
      const over = await routeProvider.quote(swap, { continuationOf: { ...parent, amount: 2000n * 10n ** 18n } });
      expect(over.kind === "rejected" && over.violations).toEqual([
        "limit: the parent input 2000000000000000000000 exceeds the per-transfer limit 1000000000000000000000",
      ]);
      const unknown = await routeProvider.quote(swap, {
        continuationOf: { chainId: 42161, asset: ASSETS.arbEth, amount: 1n, bridgeOutput: BASE_USDC },
      });
      expect(unknown.kind === "rejected" && kinds(unknown.violations)).toEqual(["limit"]);
    });
  });

  describe("re-evaluation of a persisted quote (decisions [L44])", () => {
    async function persisted() {
      const { routeProvider } = provider();
      const result = await routeProvider.quote(baseUsdc(100_000_000n));
      if (result.kind !== "quote") throw new Error("expected an approved quote");
      // Through the journal encoding, as the transfer step machine keeps it.
      const stored = cloneJson(storeQuote(result.quote, new Date()) as unknown as JsonValue) as unknown as ReturnType<
        typeof storeQuote
      >;
      return quoteOf(stored, { fromChainId: 8453, fromAsset: ASSETS.baseUsdc }, 42161);
    }

    it("passes an unchanged quote under the same policy, the daily limit left to the send-time check", async () => {
      const quote = await persisted();
      const { routeProvider, journal, clock } = provider();
      await journal.ledger.recordSpend({
        chainId: 8453,
        asset: BASE_USDC,
        category: "transfer",
        amount: 10n ** 30n,
        operationId: "op-x",
        at: clock.now(),
      });
      expect(routeProvider.recheck(baseUsdc(100_000_000n), quote)).toEqual([]);
    });

    it("blocks it once the operator revokes its target, spender, tool or limit", async () => {
      const quote = await persisted();
      const approving = approvingLifiConfig();
      const recheck = (lifi: Partial<LifiConfig>) =>
        kinds(provider(SIGNER, undefined, lifi).routeProvider.recheck(baseUsdc(100_000_000n), quote));
      expect(recheck({ allowedTargets: approving.allowedTargets.filter((t) => t.chainId !== 8453) })).toEqual([
        "target",
      ]);
      // The approval and the bridge step both name the spender.
      expect(recheck({ allowedSpenders: [] })).toEqual(["spender", "spender"]);
      expect(recheck({ allowedTools: ["feeCollection", "gasZipBridge"] })).toEqual(["tool"]);
      expect(
        recheck({
          limits: approving.limits.map((l) => (l.asset === BASE_USDC ? { ...l, perTransfer: "50" } : l)),
        })
      ).toEqual(["limit"]);
    });

    it("rejects a quote that carries no LI.FI details", async () => {
      const quote = { ...(await persisted()), raw: null };
      expect(provider().routeProvider.recheck(baseUsdc(100_000_000n), quote)).toEqual([
        "policy: the persisted quote carries no LI.FI details to re-evaluate",
      ]);
    });
  });

  it("computes the daily limit from Ledger.spentSince over the last 24 hours", async () => {
    const { routeProvider, journal, clock } = provider();
    const spend = (amount: bigint, hoursAgo: number) =>
      journal.ledger.recordSpend({
        chainId: 8453,
        asset: ASSETS.baseUsdc.address,
        category: "transfer",
        amount,
        operationId: "op-x",
        at: new Date(clock.now().getTime() - hoursAgo * 3_600_000),
      });
    await spend(4_000_000_000n, 30); // outside the window
    await spend(4_850_000_000n, 2);
    expect((await routeProvider.quote(baseUsdc(100_000_000n))).kind).toBe("quote");
    await spend(100_000_000n, 1);
    const result = await routeProvider.quote(baseUsdc(100_000_000n));
    expect(result.kind).toBe("rejected");
    if (result.kind === "rejected") expect(kinds(result.violations)).toEqual(["daily-limit"]);
  });

  it("rejects LI.FI token decimals or addresses that differ from the configured assets", async () => {
    // A toToken.decimals of 6 for Arbitrum ETH would scale the minimum output up by 1e12.
    const decimals = provider(
      SIGNER,
      rewritingFetch((body) => (body.action.toToken.decimals = 6))
    );
    const inflated = await decimals.routeProvider.quote(baseUsdc(100_000_000n));
    expect(inflated.kind).toBe("rejected");
    if (inflated.kind === "rejected") {
      expect(inflated.violations).toContain(
        "asset: LI.FI toToken decimals 6 differ from the configured 18 of ETH@42161"
      );
    }
    const fromDecimals = provider(
      SIGNER,
      rewritingFetch((body) => (body.action.fromToken.decimals = 18))
    );
    const input = await fromDecimals.routeProvider.quote(baseUsdc(100_000_000n));
    expect(input.kind).toBe("rejected");
    if (input.kind === "rejected") {
      expect(input.violations).toContain(
        "asset: LI.FI fromToken decimals 18 differ from the configured 6 of USDC@8453"
      );
    }
    const address = provider(
      SIGNER,
      rewritingFetch((body) => (body.action.fromToken.address = OTHER))
    );
    const token = await address.routeProvider.quote(baseUsdc(100_000_000n));
    expect(token.kind).toBe("rejected");
    if (token.kind === "rejected") {
      expect(token.violations).toContain(`asset: LI.FI fromToken ${OTHER} is not the configured USDC@8453`);
    }
  });

  it("rejects an ERC20 input whose quote names no approvalAddress", async () => {
    const { routeProvider } = provider(
      SIGNER,
      rewritingFetch((body) => delete body.estimate.approvalAddress)
    );
    const result = await routeProvider.quote(baseUsdc(100_000_000n));
    expect(result.kind).toBe("rejected");
    if (result.kind === "rejected") {
      expect(result.violations).toEqual(["approval: the quote names no approvalAddress for an ERC20 input"]);
    }
  });

  it("rejects a recorded quote whose recipient is not the configured signer", async () => {
    const { routeProvider } = provider(FAKE_SIGNER === SIGNER ? OTHER : FAKE_SIGNER);
    const result = await routeProvider.quote(baseUsdc(100_000_000n));
    expect(result.kind).toBe("rejected");
    if (result.kind === "rejected")
      expect(new Set(kinds(result.violations))).toEqual(new Set(["recipient", "calldata"]));
  });
});

describe("lifi configuration against the topology (decisions [L36])", () => {
  it("accepts limits whose decimals match the topology assets", () => {
    const config = mainnetConfig();
    expect(validateLifiConfig(config.lifi, config.topology)).toEqual([]);
    const example = exampleConfig({ lifi: { limits: [] } });
    expect(validateLifiConfig(example.lifi, example.topology)).toEqual([]);
  });

  it("rejects limits[].decimals that differ from the topology asset, an unknown chain or asset", () => {
    const config = mainnetConfig({
      limits: [
        { chainId: 8453, asset: "native", decimals: 18, perTransfer: "1", daily: "2" },
        // Base USDC has 6 decimals: with 18 the limit "1000" would allow 1e15 USDC.
        { chainId: 8453, asset: BASE_USDC, decimals: 18, perTransfer: "1000", daily: "5000" },
        // Arc's native unit has 18 decimals in the topology, LI.FI's token 6: the limit is in the topology's.
        { chainId: 5042, asset: "native", decimals: 6, perTransfer: "1000", daily: "5000" },
        { chainId: 10, asset: "native", decimals: 18, perTransfer: "1", daily: "1" },
        {
          chainId: 8453,
          asset: "0x00000000000000000000000000000000000000ee",
          decimals: 6,
          perTransfer: "1",
          daily: "1",
        },
      ],
    });
    expect(validateLifiConfig(config.lifi, config.topology)).toEqual([
      "lifi.limits[1].decimals: 18 differs from the topology's 6 for USDC on chain 8453",
      "lifi.limits[2].decimals: 6 differs from the topology's 18 for native USDC of chain 5042",
      "lifi.limits[3]: chain 10 is not in the topology",
      "lifi.limits[4]: 0x00000000000000000000000000000000000000ee on chain 8453 is not a topology asset, so its " +
        "decimals cannot be checked",
    ]);
  });

  it("makes the lane factories refuse a section with a wrong decimals", () => {
    const ports = makeFakePorts(
      exampleConfig({
        lifi: {
          limits: [
            {
              chainId: EXAMPLE_CHAINS.foreignEth,
              asset: EXAMPLE_ADDRESSES.usdcOnForeignEth,
              decimals: 18,
              perTransfer: "1",
              daily: "1",
            },
          ],
        },
      })
    );
    const priceOracle = new FakePriceOracle();
    expect(() => createRouteProvider(ports, { priceOracle })).toThrow(/^invalid lifi configuration: lifi\.limits\[0\]/);
    expect(() => createTransfers(ports, { routeProvider: new FakeRouteProvider(), priceOracle })).toThrow(
      /lifi\.limits\[0\]\.decimals: 18 differs from the topology's 6/
    );
  });
});
