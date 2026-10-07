/** Shared fixtures of the reporter tests (fakes only, no network). */
import { parseUnits } from "viem";
import type { AppConfigInput } from "../config/schema";
import type { Asset, TickContext } from "../domain";
import {
  EXAMPLE_ADDRESSES,
  EXAMPLE_CHAINS,
  FakeForeignGatewayTreasury,
  FakeHomeGatewayFunding,
  FakeReporterFunding,
  FakeRouteProvider,
  FakeTransfers,
  exampleConfig,
  makeFakePorts,
  makeQuote,
  type FakePorts,
} from "../testing";
import { ReporterFundingLoop } from "./loop";
import { routeContext, type PlannerDeps } from "./planner";

export const ROUTES = {
  usdcForeign: "usdc-home->home",
  usdcHome: "home->usdc-home",
  ethForeign: "eth-home->home",
  ethHome: "home->eth-home",
} as const;

export const ASSETS = {
  usdcNative: { chainId: EXAMPLE_CHAINS.foreignUsdc, address: "native", symbol: "USDC", decimals: 18 } as Asset,
  ethNative: { chainId: EXAMPLE_CHAINS.foreignEth, address: "native", symbol: "ETH", decimals: 18 } as Asset,
  baseUsdc: {
    chainId: EXAMPLE_CHAINS.foreignEth,
    address: EXAMPLE_ADDRESSES.usdcOnForeignEth,
    symbol: "USDC",
    decimals: 6,
  } as Asset,
  homeEth: { chainId: EXAMPLE_CHAINS.home, address: "native", symbol: "ETH", decimals: 18 } as Asset,
};

/** Cost per message: 0.5 USDC on the USDC chain, 0.0002 ETH elsewhere; low-water 20, target 100 messages. */
export const COST = {
  usdc: parseUnits("0.5", 18),
  eth: parseUnits("0.0002", 18),
};

export function reporterSection(overrides: Record<string, unknown> = {}): AppConfigInput["reporter"] {
  return {
    routes: {
      [ROUTES.usdcForeign]: { costPerMessage: "0.5" },
      [ROUTES.usdcHome]: { costPerMessage: "0.0002" },
      [ROUTES.ethForeign]: { costPerMessage: "0.0002" },
      [ROUTES.ethHome]: { costPerMessage: "0.0002" },
    },
    ...overrides,
  } as AppConfigInput["reporter"];
}

/** 1 USDC (18 or 6 decimals) is worth 0.0004 ETH in the scripted quotes. */
export function usdcToEth(amount: bigint, decimals: number): bigint {
  return (amount * 4n * 10n ** 14n) / 10n ** BigInt(decimals);
}

export interface Harness {
  ports: FakePorts;
  funding: FakeReporterFunding;
  routeProvider: FakeRouteProvider;
  transfers: FakeTransfers;
  treasuries: Map<string, FakeForeignGatewayTreasury>;
  homeGateways: Map<string, FakeHomeGatewayFunding>;
  route(id: string): ReturnType<typeof routeContext>;
  loop(id: string): ReporterFundingLoop;
  plannerDeps(pairId: string): PlannerDeps;
  tickCtx(): TickContext;
}

export function harness(reporter: AppConfigInput["reporter"] = reporterSection(), ports?: FakePorts): Harness {
  const p = ports ?? makeFakePorts(exampleConfig({ reporter }));
  const funding = new FakeReporterFunding();
  const routeProvider = new FakeRouteProvider();
  routeProvider.onQuote(
    (request) => request.fromAsset.symbol === "USDC" && request.toAsset.symbol === "ETH",
    (request) => ({
      kind: "quote",
      quote: makeQuote(request, { estimatedOutput: usdcToEth(request.amount, request.fromAsset.decimals) }),
    })
  );
  const transfers = new FakeTransfers(p.journal);
  const treasuries = new Map<string, FakeForeignGatewayTreasury>([
    [
      "usdc-home",
      new FakeForeignGatewayTreasury("usdc-home", EXAMPLE_CHAINS.foreignUsdc, EXAMPLE_ADDRESSES.foreignGatewayUsdc),
    ],
    [
      "eth-home",
      new FakeForeignGatewayTreasury("eth-home", EXAMPLE_CHAINS.foreignEth, EXAMPLE_ADDRESSES.foreignGatewayEth),
    ],
  ]);
  const homeGateways = new Map<string, FakeHomeGatewayFunding>([
    ["usdc-home", new FakeHomeGatewayFunding("usdc-home", EXAMPLE_CHAINS.home, EXAMPLE_ADDRESSES.homeGatewayUsdc)],
    ["eth-home", new FakeHomeGatewayFunding("eth-home", EXAMPLE_CHAINS.home, EXAMPLE_ADDRESSES.homeGatewayEth)],
  ]);
  const routeOf = (id: string) => {
    const route = p.config.topology.routes.find((r) => r.id === id);
    if (!route) throw new Error(`unknown route ${id}`);
    return route;
  };
  return {
    ports: p,
    funding,
    routeProvider,
    transfers,
    treasuries,
    homeGateways,
    route: (id) => routeContext(p.config, routeOf(id)),
    loop: (id) =>
      new ReporterFundingLoop(routeOf(id), {
        ports: p,
        funding,
        treasury: treasuries.get(routeOf(id).pairId),
        transfers,
        routeProvider,
      }),
    plannerDeps: (pairId) => ({
      config: p.config,
      journal: p.journal,
      funding,
      treasury: treasuries.get(pairId),
      routeProvider,
      signer: p.signer,
    }),
    tickCtx: () => ({ now: p.clock.now(), signal: new AbortController().signal }),
  };
}
