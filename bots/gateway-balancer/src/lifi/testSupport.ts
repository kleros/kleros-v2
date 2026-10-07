import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { appConfigSchema, type AppConfig } from "../config/schema";
import { decodeFunctionData, encodeFunctionData, erc20Abi } from "viem";
import type { Address, Asset, Hex } from "../domain";
import type { RouteQuote, RouteRequest } from "../ports";
import { FAKE_LIFI_DIAMOND, type FakePorts, type FakeRouteProvider } from "../testing";
import { LIFI_CALLDATA_ABI, diamondToken } from "./calldata";
import type { LifiConfig } from "./config";
import { lifiConfigSchema } from "./config";

/** Test support for the LI.FI tests: recorded fixtures served through an injected `fetch`, never the network. */

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), "fixtures");

export function fixtureText(name: string): string {
  return readFileSync(join(fixturesDir, name), "utf8");
}

export function fixture<T = unknown>(name: string): T {
  return JSON.parse(fixtureText(name)) as T;
}

export interface FixtureRoute {
  match: (url: URL) => boolean;
  file: string;
  status?: number;
}

/** A `fetch` that answers from fixtures and records every URL; an unmatched request throws. */
export function fixtureFetch(routes: FixtureRoute[]): typeof globalThis.fetch & { urls: URL[] } {
  const urls: URL[] = [];
  const fetchStub = (async (input: string | URL | Request) => {
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
    urls.push(url);
    const route = routes.find((r) => r.match(url));
    if (!route) throw new Error(`no fixture for ${url.pathname}?${url.searchParams.toString()}`);
    return new Response(fixtureText(route.file), {
      status: route.status ?? 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof globalThis.fetch & { urls: URL[] };
  fetchStub.urls = urls;
  return fetchStub;
}

const q = (url: URL, key: string) => url.searchParams.get(key)?.toLowerCase();

export const SIGNER: Address = "0x1000000000000000000000000000000000000001";
export const LIFI_DIAMOND: Address = "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE";
export const GASZIP: Address = "0xA4072583658Fae592A3506A42431cb6316a8d40b";
export const BASE_USDC: Address = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
export const ARB_WETH: Address = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
export const ARC_NATIVE_USDC: Address = "0x3600000000000000000000000000000000000000";
export const ZERO: Address = "0x0000000000000000000000000000000000000000";
/** Contracts the recorded quotes' `SwapData[]` call or approve, and the recorded LayerSwap depositories. */
export const FEE_COLLECTOR_BASE: Address = "0xCE40449B773a3E6E5e769ADb4e567179d4828cbd";
export const FEE_COLLECTOR_ARC: Address = "0xEDff4051B8286d2333149429F019dC10E23570da";
export const OKX_ROUTER_BASE: Address = "0x67d03631FE51B741C0C00c4E16eb662AC84381df";
export const OKX_APPROVE_BASE: Address = "0x57df6092665eb6058DE53939612413ff4B09114E";
/** LI.FI's fee wallet, paid by the recorded fee steps (`forwardNativeFees`, `forwardERC20Fees`) on Base and Arc. */
export const LIFI_FEE_WALLET: Address = "0xC06ebbefD94032B85424D51906e2A335EFAe264B";
export const LAYERSWAP_DEPOSITORY_ETH: Address = "0x2Fc617E933a52713247CE25730f6695920B3befe";
export const LAYERSWAP_DEPOSITORY_USDC: Address = "0x08b00cEEE2Fb66029B53D76110B19eeAabfd1e65";

/** The recorded quotes, keyed by the request that produced them. */
export const QUOTE_ROUTES: FixtureRoute[] = [
  {
    match: (u) =>
      u.pathname.endsWith("/quote") &&
      q(u, "fromChain") === "8453" &&
      q(u, "toChain") === "42161" &&
      q(u, "fromToken") === ZERO,
    file: "quote-base-eth-to-arbitrum-eth.json",
  },
  {
    match: (u) =>
      u.pathname.endsWith("/quote") &&
      q(u, "fromChain") === "8453" &&
      q(u, "toChain") === "42161" &&
      q(u, "fromToken") === BASE_USDC.toLowerCase(),
    file: "quote-base-usdc-to-arbitrum-eth.json",
  },
  {
    match: (u) => u.pathname.endsWith("/quote") && q(u, "fromChain") === "8453" && q(u, "toChain") === "8453",
    file: "quote-base-usdc-to-base-eth.json",
  },
  {
    match: (u) => u.pathname.endsWith("/quote") && q(u, "fromChain") === "5042" && q(u, "toChain") === "42161",
    file: "quote-arc-usdc-to-arbitrum-eth.json",
  },
  {
    match: (u) => u.pathname.endsWith("/quote") && q(u, "fromChain") === "5042002",
    file: "quote-arc-testnet-usdc-to-arbitrum-sepolia-eth.404.json",
    status: 404,
  },
  { match: (u) => u.pathname.endsWith("/tools"), file: "tools.json" },
];

export const ASSETS = {
  baseEth: { chainId: 8453, address: "native", symbol: "ETH", decimals: 18 } as Asset,
  baseUsdc: { chainId: 8453, address: BASE_USDC, symbol: "USDC", decimals: 6 } as Asset,
  arbEth: { chainId: 42161, address: "native", symbol: "ETH", decimals: 18 } as Asset,
  arcUsdc: { chainId: 5042, address: "native", symbol: "USDC", decimals: 18 } as Asset,
  arcTestnetUsdc: { chainId: 5042002, address: "native", symbol: "USDC", decimals: 18 } as Asset,
};

/** Allowlists covering the recorded routes, with generous limits. */
export function approvingLifiConfig(overrides: Partial<LifiConfig> = {}): LifiConfig {
  return lifiConfigSchema.parse({
    allowedChains: [8453, 42161, 5042, 5042002],
    allowedTools: ["feeCollection", "layerswap", "okx", "gasZipBridge"],
    allowedAssets: [
      { chainId: 8453, address: "native" },
      { chainId: 8453, address: BASE_USDC },
      { chainId: 42161, address: "native" },
      { chainId: 5042, address: "native" },
      { chainId: 5042002, address: "native" },
    ],
    allowedTargets: [
      { chainId: 8453, address: LIFI_DIAMOND },
      { chainId: 5042, address: GASZIP },
    ],
    allowedSpenders: [
      { chainId: 8453, address: LIFI_DIAMOND },
      { chainId: 5042, address: GASZIP },
    ],
    allowedSwapContracts: [
      { chainId: 8453, address: FEE_COLLECTOR_BASE },
      { chainId: 8453, address: OKX_ROUTER_BASE },
      { chainId: 8453, address: OKX_APPROVE_BASE },
      { chainId: 5042, address: FEE_COLLECTOR_ARC },
    ],
    layerSwapDepositories: [
      { chainId: 8453, address: LAYERSWAP_DEPOSITORY_ETH },
      { chainId: 8453, address: LAYERSWAP_DEPOSITORY_USDC },
    ],
    feeRecipients: [
      { chainId: 8453, address: LIFI_FEE_WALLET },
      { chainId: 5042, address: LIFI_FEE_WALLET },
    ],
    limits: [
      { chainId: 8453, asset: "native", decimals: 18, perTransfer: "1", daily: "2" },
      { chainId: 8453, asset: BASE_USDC, decimals: 6, perTransfer: "1000", daily: "5000" },
      { chainId: 5042, asset: "native", decimals: 18, perTransfer: "1000", daily: "5000" },
      { chainId: 5042002, asset: "native", decimals: 18, perTransfer: "1000", daily: "5000" },
    ],
    nativeTokens: [
      { chainId: 5042, address: ARC_NATIVE_USDC, decimals: 6 },
      { chainId: 5042002, address: ARC_NATIVE_USDC, decimals: 6 },
    ],
    ...overrides,
  });
}

/** Mainnet-shaped topology (Base and Arc into Arbitrum) for the fixtures. */
export function mainnetConfig(lifi: Partial<LifiConfig> = {}): AppConfig {
  return appConfigSchema.parse({
    topology: {
      chains: [
        { id: 42161, name: "arbitrum", rpcUrlEnv: "ARBITRUM_RPC_URL", nativeSymbol: "ETH", wrappedNative: ARB_WETH },
        { id: 8453, name: "base", rpcUrlEnv: "BASE_RPC_URL", nativeSymbol: "ETH" },
        { id: 5042, name: "arc", rpcUrlEnv: "ARC_RPC_URL", nativeSymbol: "USDC", nativeDecimals: 18 },
        {
          id: 5042002,
          name: "arc-testnet",
          rpcUrlEnv: "ARC_TESTNET_RPC_URL",
          nativeSymbol: "USDC",
          nativeDecimals: 18,
        },
      ],
      pairs: [
        {
          id: "arc-arbitrum",
          foreignChainId: 5042,
          foreignGateway: "0x00000000000000000000000000000000000000a1",
          homeChainId: 42161,
          homeGateway: "0x00000000000000000000000000000000000000b1",
          collectedAssets: [ASSETS.arcUsdc],
        },
        {
          id: "base-arbitrum",
          foreignChainId: 8453,
          foreignGateway: "0x00000000000000000000000000000000000000a2",
          homeChainId: 42161,
          homeGateway: "0x00000000000000000000000000000000000000b2",
          collectedAssets: [ASSETS.baseEth, ASSETS.baseUsdc],
        },
      ],
      routes: [],
    },
    lifi: { ...approvingLifiConfig(), ...lifi },
  });
}

/**
 * A LI.FI bridge call (the recorded LayerSwap entry point, no source swaps) that agrees with `quote`: receiver
 * `signer`, the quote's destination chain, input token and amount. Quotes built with `makeQuote` carry placeholder
 * calldata, which the policy rejects.
 */
export function bridgeCalldata(quote: RouteQuote, signer: Address): Hex {
  return encodeFunctionData({
    abi: LIFI_CALLDATA_ABI,
    functionName: "swapAndStartBridgeTokensViaLayerSwap",
    args: [
      {
        transactionId: `0x${"11".repeat(32)}`,
        bridge: "layerswap",
        integrator: "test",
        referrer: ZERO,
        sendingAssetId: diamondToken(quote.fromAsset.address),
        receiver: signer,
        minAmount: quote.inputAmount,
        destinationChainId: BigInt(quote.toChainId),
        hasSourceSwaps: false,
        hasDestinationCall: false,
      },
      [],
      {
        requestId: `0x${"22".repeat(32)}`,
        depositoryReceiver: "0x2Fc617E933a52713247CE25730f6695920B3befe",
        receiver: signer,
        nonEVMReceiver: `0x${"00".repeat(32)}`,
        signature: "0x",
        deadline: 1n,
      },
    ],
  });
}

/**
 * `quote` with its bridge step's calldata replaced by `bridgeCalldata`; the quote and its step become LayerSwap's
 * (`layerswap`), the tool that facet belongs to (decisions [L44]).
 */
export function withBridgeCalldata(quote: RouteQuote, signer: Address): RouteQuote {
  const data = bridgeCalldata(quote, signer);
  return {
    ...quote,
    tool: "layerswap",
    steps: quote.steps.map((step) =>
      step.kind === "approve" ? step : { ...step, tool: "layerswap", tx: { ...step.tx, data } }
    ),
  };
}

/**
 * Answers `allowance` reads on every fake chain from the fake executor's history, like the token would: a confirmed
 * approval sets it (an overwrite, not an addition) and a confirmed bridge send spends it (every leg of these tests
 * moves the whole approved amount).
 */
export function simulateAllowances(ports: FakePorts) {
  for (const chain of ports.chains.values()) {
    chain.onRead(
      (call) => call.functionName === "allowance",
      (call: { address: Address }) => {
        let allowance = 0n;
        for (const { request, outcome } of ports.executor.submissions) {
          if (outcome.status !== "confirmed" || request.chainId !== chain.chainId) continue;
          if (request.to.toLowerCase() === call.address.toLowerCase() && request.data) {
            const decoded = decodeFunctionData({ abi: erc20Abi, data: request.data });
            if (decoded.functionName === "approve") allowance = decoded.args[1];
          } else if (request.to.toLowerCase() === FAKE_LIFI_DIAMOND.toLowerCase()) allowance = 0n;
        }
        return allowance;
      }
    );
  }
}

/** A `FakeRouteProvider` with a scriptable `recheck`, the policy re-evaluation `LifiTransfers` requires. */
export type RecheckingFakeRouteProvider = FakeRouteProvider & {
  recheck: (request: RouteRequest, quote: RouteQuote, options?: unknown) => string[];
  /** The violations every `recheck` returns (none by default). */
  verdict: { violations: string[] };
  rechecks: { request: RouteRequest; quote: RouteQuote; options: unknown }[];
};

/**
 * Gives the fake provider a policy re-evaluation of its own, as `LifiRouteProvider.recheck` (decisions [L44], [L59]):
 * the shared default of the lane's transfer tests, since `LifiTransfers` refuses a provider without one. Idempotent.
 */
export function withRecheck(routes: FakeRouteProvider): RecheckingFakeRouteProvider {
  const existing = routes as Partial<RecheckingFakeRouteProvider>;
  if (existing.verdict && existing.rechecks) return routes as RecheckingFakeRouteProvider;
  const verdict = { violations: [] as string[] };
  const rechecks: RecheckingFakeRouteProvider["rechecks"] = [];
  return Object.assign(routes, {
    verdict,
    rechecks,
    recheck: (request: RouteRequest, quote: RouteQuote, options?: unknown) => {
      rechecks.push({ request, quote, options });
      return verdict.violations;
    },
  });
}
