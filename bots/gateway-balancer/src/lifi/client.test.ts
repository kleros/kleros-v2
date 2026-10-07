import { decodeFunctionData, erc20Abi } from "viem";
import { describe, expect, it } from "vitest";
import type { RouteRequest } from "../ports";
import { FakePriceOracle } from "../testing";
import { LifiClient } from "./client";
import { normalizeFees } from "./slippage";
import {
  ARC_NATIVE_USDC,
  ASSETS,
  BASE_USDC,
  GASZIP,
  LIFI_DIAMOND,
  QUOTE_ROUTES,
  SIGNER,
  approvingLifiConfig,
  fixtureFetch,
  fixtureText,
  mainnetConfig,
} from "./testSupport";

function client(routes = QUOTE_ROUTES) {
  const config = mainnetConfig();
  const fetch = fixtureFetch(routes);
  return { client: new LifiClient({ fetch, config: approvingLifiConfig(), chains: config.topology.chains }), fetch };
}

/** A client answering every request with `body` and `status` (a rewritten fixture). */
function answering(body: unknown, status = 200) {
  const config = mainnetConfig();
  const fetch = (async () => new Response(JSON.stringify(body), { status })) as unknown as typeof globalThis.fetch;
  return new LifiClient({ fetch, config: approvingLifiConfig(), chains: config.topology.chains });
}

function request(overrides: Partial<RouteRequest>): RouteRequest {
  return {
    fromChainId: 8453,
    fromAsset: ASSETS.baseEth,
    toChainId: 42161,
    toAsset: ASSETS.arbEth,
    amount: 5n * 10n ** 16n,
    sender: SIGNER,
    recipient: SIGNER,
    purpose: "refill",
    ...overrides,
  };
}

describe("LI.FI client: quotes", () => {
  it("compares LI.FI's token addresses and decimals with the configured assets before scaling", async () => {
    const { client: lifi } = client();
    for (const req of [
      request({}),
      request({ fromAsset: ASSETS.baseUsdc, amount: 100_000_000n }),
      request({ fromAsset: ASSETS.baseUsdc, toChainId: 8453, toAsset: ASSETS.baseEth, amount: 100_000_000n }),
      request({ fromChainId: 5042, fromAsset: ASSETS.arcUsdc, amount: 100n * 10n ** 18n }),
    ]) {
      const result = await lifi.quote(req);
      if (result.kind !== "quote") throw new Error(result.reason);
      expect(result.parsed.details.tokenViolations).toEqual([]);
    }
    const body = JSON.parse(fixtureText("quote-base-eth-to-arbitrum-eth.json")) as {
      action: { toToken: { decimals: number } };
    };
    body.action.toToken.decimals = 6;
    const misreported = new LifiClient({
      fetch: (async () => new Response(JSON.stringify(body), { status: 200 })) as unknown as typeof fetch,
      config: approvingLifiConfig(),
      chains: mainnetConfig().topology.chains,
    });
    const result = await misreported.quote(request({}));
    if (result.kind !== "quote") throw new Error(result.reason);
    expect(result.parsed.details.tokenViolations).toEqual([
      "asset: LI.FI toToken decimals 6 differ from the configured 18 of ETH@42161",
    ]);
  });

  it("asks for a one-step quote to the signer without chain switching", async () => {
    const { client: lifi, fetch } = client();
    await lifi.quote(request({}));
    const url = fetch.urls[0]!;
    expect(url.origin + url.pathname).toBe("https://li.quest/v1/quote");
    expect(Object.fromEntries(url.searchParams)).toMatchObject({
      fromChain: "8453",
      toChain: "42161",
      fromToken: "0x0000000000000000000000000000000000000000",
      toToken: "0x0000000000000000000000000000000000000000",
      fromAmount: "50000000000000000",
      fromAddress: SIGNER,
      toAddress: SIGNER,
      allowSwitchChain: "false",
    });
  });

  it("parses the recorded Base ETH -> Arbitrum ETH quote", async () => {
    const { client: lifi } = client();
    const result = await lifi.quote(request({}));
    if (result.kind !== "quote") throw new Error(result.reason);
    const { quote, details, fees } = result.parsed;
    expect(quote).toMatchObject({
      tool: "layerswap",
      fromChainId: 8453,
      toChainId: 42161,
      inputAmount: 50_000_000_000_000_000n,
      estimatedOutput: 49_872_310_000_000_000n,
      minimumOutput: 49_622_940_000_000_000n,
      deliversWrapped: false,
    });
    expect(quote.fromAsset.address).toBe("native");
    expect(quote.toAsset.address).toBe("native");
    expect(quote.steps).toHaveLength(1);
    expect(quote.steps[0]).toMatchObject({ kind: "cross", tool: "layerswap", target: LIFI_DIAMOND });
    expect(quote.steps[0]!.tx).toMatchObject({ chainId: 8453, to: LIFI_DIAMOND, value: 50_000_000_000_000_000n });
    expect(quote.steps[0]!.spender).toBeUndefined();
    expect(details).toMatchObject({ recipient: SIGNER, sender: SIGNER, txFrom: SIGNER, extraNativeValue: 0n });
    expect(details.includedTools).toEqual(["feeCollection", "layerswap"]);
    expect(fees.map((f) => f.amount)).toEqual([125_000_000_000_000n, 2_690_000_000_000n]);
    expect(quote.gasCostsNative).toBe(1_071_366_000_000n);
    // ETH fees into an ETH output need no price.
    const normalized = await normalizeFees(new FakePriceOracle(), {}, fees, ASSETS.arbEth);
    expect(normalized).toEqual({
      kind: "fees",
      amount: 127_690_000_000_000n,
      included: 127_690_000_000_000n,
      onTop: 0n,
    });
  });

  it("parses an ERC20 quote with a bounded approval to the quoted spender and fees normalized into ETH", async () => {
    const { client: lifi } = client();
    const result = await lifi.quote(request({ fromAsset: ASSETS.baseUsdc, amount: 100_000_000n }));
    if (result.kind !== "quote") throw new Error(result.reason);
    const { quote, fees } = result.parsed;
    expect(quote.steps.map((s) => s.kind)).toEqual(["approve", "cross"]);
    const [approve, cross] = quote.steps;
    expect(approve).toMatchObject({ target: BASE_USDC, spender: LIFI_DIAMOND, approvalAmount: 100_000_000n });
    expect(approve!.tx).toMatchObject({ chainId: 8453, to: BASE_USDC, value: 0n });
    expect(decodeFunctionData({ abi: erc20Abi, data: approve!.tx.data! }).args).toEqual([LIFI_DIAMOND, 100_000_000n]);
    expect(cross).toMatchObject({ tool: "layerswap", target: LIFI_DIAMOND, spender: LIFI_DIAMOND });
    expect(cross!.tx.value).toBe(0n);
    expect(quote.minimumOutput).toBe(36_718_190_000_000_000n);
    const oracle = new FakePriceOracle().set("ETH", 2700n * 10n ** 18n).set("USDC", 10n ** 18n);
    const normalized = await normalizeFees(oracle, {}, fees, ASSETS.arbEth);
    // 0.25 USDC and 0.021095 USDC at 1 USD into ETH at 2700 USD, each floored.
    const toEth = (usdcUnits: bigint) => (usdcUnits * 10n ** 12n) / 2700n;
    expect(normalized).toMatchObject({ kind: "fees", amount: toEth(250_000n) + toEth(21_095n), onTop: 0n });
  });

  it("parses Arc's native USDC through LI.FI's 6-decimal token into the chain's 18-decimal native unit", async () => {
    const { client: lifi, fetch } = client();
    const result = await lifi.quote(
      request({ fromChainId: 5042, fromAsset: ASSETS.arcUsdc, amount: 100n * 10n ** 18n + 123n })
    );
    expect(fetch.urls[0]!.searchParams.get("fromToken")).toBe(ARC_NATIVE_USDC);
    expect(fetch.urls[0]!.searchParams.get("fromAmount")).toBe("100000000");
    if (result.kind !== "quote") throw new Error(result.reason);
    const { quote, details } = result.parsed;
    expect(quote.fromAsset).toMatchObject({ chainId: 5042, address: "native", decimals: 18 });
    expect(quote.inputAmount).toBe(100n * 10n ** 18n);
    expect(quote.steps).toHaveLength(1);
    expect(quote.steps[0]).toMatchObject({ kind: "cross", tool: "gasZipBridge", target: GASZIP });
    expect(quote.steps[0]!.tx.value).toBe(100n * 10n ** 18n);
    expect(details.dustAllowance).toBe(10n ** 12n - 1n);
  });

  it("parses the local Base USDC -> Base ETH swap", async () => {
    const { client: lifi } = client();
    const result = await lifi.quote(
      request({ toChainId: 8453, toAsset: ASSETS.baseEth, fromAsset: ASSETS.baseUsdc, amount: 100_000_000n })
    );
    if (result.kind !== "quote") throw new Error(result.reason);
    expect(result.parsed.quote.steps.map((s) => s.kind)).toEqual(["approve", "swap"]);
    expect(result.parsed.quote.tool).toBe("okx");
  });

  it("maps the recorded 404 / code 1002 answer to no-route", async () => {
    const { client: lifi } = client();
    const result = await lifi.quote(
      request({ fromChainId: 5042002, fromAsset: ASSETS.arcTestnetUsdc, amount: 10n ** 20n })
    );
    expect(result.kind).toBe("no-route");
    if (result.kind === "no-route") expect(result.reason).toMatch(/code 1002: No available quotes/);
  });

  it("treats only the quote endpoint's 404 with code 1002 as no-route (decisions [L49])", async () => {
    const noQuotes = { message: "No available quotes for the requested transfer", code: 1002 };
    expect((await answering(noQuotes, 404).quote(request({}))).kind).toBe("no-route");
    // A 404 without the code (a wrong endpoint path) and code 1002 under another status are failures.
    await expect(answering({ message: "Not Found" }, 404).quote(request({}))).rejects.toThrow(/HTTP 404/);
    await expect(answering({}, 404).quote(request({}))).rejects.toThrow(/HTTP 404/);
    await expect(answering(noQuotes, 400).quote(request({}))).rejects.toThrow(/HTTP 400 code 1002/);
  });

  it("treats a fee without the included flag as paid on top, never deducted (decisions [L49])", async () => {
    const body = JSON.parse(fixtureText("quote-base-eth-to-arbitrum-eth.json"));
    for (const fee of body.estimate.feeCosts) delete fee.included;
    const result = await answering(body).quote(request({}));
    if (result.kind !== "quote") throw new Error(result.reason);
    const { fees, details } = result.parsed;
    expect(fees.map((f) => f.included)).toEqual([false, false]);
    // Native on the source chain: expected on top of the input in the transaction's value.
    expect(details.extraNativeValue).toBe(127_690_000_000_000n);
    const normalized = await normalizeFees(new FakePriceOracle(), {}, fees, ASSETS.arbEth);
    expect(normalized).toEqual({
      kind: "fees",
      amount: -127_690_000_000_000n,
      included: 0n,
      onTop: 127_690_000_000_000n,
    });
  });

  it("throws on an unexpected HTTP error instead of inventing a route", async () => {
    const { client: lifi } = client([{ match: () => true, file: "status-not-found.404.json", status: 500 }]);
    await expect(lifi.quote(request({}))).rejects.toThrow(/HTTP 500/);
  });

  it("lists the recorded tools", async () => {
    const { client: lifi } = client();
    const tools = await lifi.tools();
    expect(tools.bridges).toContain("across");
    expect(tools.exchanges.length).toBeGreaterThan(0);
  });
});

describe("LI.FI client: status", () => {
  const ref = {
    tool: "layerswap",
    txHash: "0xeae0dba81c06502c8929e14b5957f895200c65c41a250e03b3ca2d5a9bb6dc73" as const,
    fromChainId: 8453,
    toChainId: 42161,
  };
  const statusClient = (file: string, status = 200) =>
    client([{ match: (u) => u.pathname.endsWith("/status"), file, status }]);

  it("maps PENDING to pending", async () => {
    const { client: lifi, fetch } = statusClient("status-pending.json");
    expect(await lifi.status(ref)).toEqual({ state: "pending" });
    expect(Object.fromEntries(fetch.urls[0]!.searchParams)).toMatchObject({
      txHash: ref.txHash,
      fromChain: "8453",
      toChain: "42161",
      bridge: "layerswap",
    });
  });

  it("maps DONE to done with LI.FI's received amount, asset and receiving transaction", async () => {
    const { client: lifi } = statusClient("status-done-eth.json");
    expect(await lifi.status(ref)).toEqual({
      state: "done",
      received: 996_270_000_000_000n,
      receivedAsset: { chainId: 42161, address: "native", symbol: "ETH", decimals: 18 },
      receivingTxHash: "0x29b7ec483eff9ac77d07993423b5f25ad211ec5f794c9f352274fd765a1787e7",
    });
    const usdc = await statusClient("status-done-usdc.json").client.status(ref);
    expect(usdc).toMatchObject({ state: "done", received: 3_147_936n, receivedAsset: { symbol: "USDC", decimals: 6 } });
  });

  it("maps FAILED to failed and a not-found answer to unknown", async () => {
    expect((await statusClient("status-failed.derived.json").client.status(ref)).state).toBe("failed");
    const unknown = await statusClient("status-not-found.404.json", 404).client.status(ref);
    expect(unknown.state).toBe("unknown");
    if (unknown.state === "unknown") expect(unknown.detail).toMatch(/404 code 1003/);
  });

  it("is unknown, never a throw, when the request itself fails", async () => {
    const lifi = new LifiClient({
      fetch: async () => {
        throw new Error("timeout");
      },
      config: approvingLifiConfig(),
      chains: mainnetConfig().topology.chains,
    });
    expect(await lifi.status(ref)).toEqual({ state: "unknown", detail: "status request failed: timeout" });
  });
});
