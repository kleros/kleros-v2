/**
 * Generates the bot's mainnet configuration (decisions [O14]): gateway addresses from the operator's deploy output
 * (`contracts/deployments/{base,arbitrum}`) or explicit flags, every reporter address from the `@kleros/veashi-sdk`
 * getters, the operator values from `./parameters`. The result is validated with the bot's full loader and schema
 * plus the mainnet checks below before anything is written. Reads no chain and no secret.
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { getAddress } from "viem";
import type { AppConfig } from "../config/schema";
import { parseConfig } from "../platform/config/load";
import { providerSource } from "../rates/config";
import {
  CHAINLINK_FEEDS,
  CHAINS,
  COINGECKO,
  COST_PER_MESSAGE,
  DEPLOYMENT_NAMES,
  DEPLOYMENT_NETWORKS,
  FOREIGN_CHAIN_ID,
  HOME_CHAIN_ID,
  LIFI_LIMITS,
  MIN_PRICE_SOURCES,
  MINIMUM_GAS_RESERVE_WEI,
  ORACLE_BRIDGES,
  PAIR_ID,
  REFERENCE_CASE_COST_ETH,
  REFILL,
  REPORTER_DEFAULTS,
  USDC_BASE,
  type BridgeKey,
} from "./parameters";
import { getReporter, type Bridge } from "./sdk";

export class MainnetConfigError extends Error {
  constructor(
    message: string,
    public readonly problems: string[]
  ) {
    super(problems.length > 0 ? `${message}:\n  - ${problems.join("\n  - ")}` : message);
    this.name = "MainnetConfigError";
  }
}

export interface GatewayAddresses {
  foreignGateway: string;
  homeGateway: string;
}

/** The deploy-output file of one Veashi deployment, e.g. `<dir>/base/VeashiForeignGateway.json`. */
export function deploymentFile(deploymentsDir: string, side: "foreign" | "home"): string {
  const name = side === "foreign" ? DEPLOYMENT_NAMES.foreignGateway : DEPLOYMENT_NAMES.homeGateway;
  return join(deploymentsDir, DEPLOYMENT_NETWORKS[side], `${name}.json`);
}

function readDeployedAddress(deploymentsDir: string, side: "foreign" | "home"): string {
  const file = deploymentFile(deploymentsDir, side);
  if (!existsSync(file)) {
    throw new MainnetConfigError("missing deploy output", [
      `${file} does not exist: run the ${side === "foreign" ? "VeashiForeign" : "VeashiHome"} deploy first, or pass ` +
        `--${side}-gateway`,
    ]);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    throw new MainnetConfigError("unreadable deploy output", [`${file}: ${(error as Error).message}`]);
  }
  const address = (parsed as { address?: unknown } | null)?.address;
  if (typeof address !== "string") throw new MainnetConfigError("invalid deploy output", [`${file}: no address`]);
  // hardhat-deploy records the network's chain id next to the deployments; a copy from another network is refused.
  const chainIdFile = join(dirname(file), ".chainId");
  const expected = side === "foreign" ? FOREIGN_CHAIN_ID : HOME_CHAIN_ID;
  if (existsSync(chainIdFile) && readFileSync(chainIdFile, "utf8").trim() !== String(expected)) {
    throw new MainnetConfigError("deploy output from another chain", [
      `${chainIdFile}: expected chain id ${expected}, found ${readFileSync(chainIdFile, "utf8").trim()}`,
    ]);
  }
  return address;
}

/** Gateway addresses from the deploy output; a flag replaces the file of its side (that file is then not read). */
export function resolveGateways(options: {
  deploymentsDir: string;
  foreignGateway?: string;
  homeGateway?: string;
}): GatewayAddresses {
  return {
    foreignGateway: options.foreignGateway ?? readDeployedAddress(options.deploymentsDir, "foreign"),
    homeGateway: options.homeGateway ?? readDeployedAddress(options.deploymentsDir, "home"),
  };
}

type Direction = "foreignToHome" | "homeToForeign";

export interface ExpectedRoute {
  id: string;
  direction: Direction;
  bridge: BridgeKey;
  /** The chain the reporter is on. */
  chainId: number;
  /** The reporter of the SDK getter for this route. */
  reporter: string;
}

function routeId(direction: Direction, bridge: string): string {
  const [from, to] = direction === "foreignToHome" ? [CHAINS.foreign, CHAINS.home] : [CHAINS.home, CHAINS.foreign];
  return `${from.name}->${to.name}:${bridge}`;
}

/** The six reporter routes (three bridges, both directions), reporters from `getReporter(source, destination, b)`. */
export function expectedRoutes(): ExpectedRoute[] {
  const routes: ExpectedRoute[] = [];
  const missing: string[] = [];
  for (const direction of ["foreignToHome", "homeToForeign"] as const) {
    const [source, destination] =
      direction === "foreignToHome" ? [FOREIGN_CHAIN_ID, HOME_CHAIN_ID] : [HOME_CHAIN_ID, FOREIGN_CHAIN_ID];
    for (const { key, label } of ORACLE_BRIDGES) {
      const reporter = getReporter(source, destination, key as Bridge);
      if (!reporter) missing.push(`getReporter(${source}, ${destination}, ${key}) is undefined in the SDK`);
      else routes.push({ id: routeId(direction, label), direction, bridge: key, chainId: source, reporter });
    }
  }
  if (missing.length > 0) throw new MainnetConfigError("reporter missing from @kleros/veashi-sdk", missing);
  return routes;
}

const ZERO = /^0x0{40}$/i;

/** Zero, the burn address and one repeated digit (0x1111…, 0xffff…) are placeholders, never a deployment. */
export function isPlaceholderAddress(address: string): boolean {
  const hex = address.slice(2).toLowerCase();
  return ZERO.test(address) || hex === "000000000000000000000000000000000000dead" || /^(.)\1{39}$/.test(hex);
}

function checkGateway(problems: string[], path: string, address: string): void {
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) problems.push(`${path}: ${address} is not an address`);
  else if (isPlaceholderAddress(address)) problems.push(`${path}: ${address} is a placeholder, not a deployed gateway`);
}

/** The raw (JSON) configuration for the given gateways. Not validated: see `validateMainnetConfig`. */
export function buildMainnetConfig(gateways: GatewayAddresses): Record<string, unknown> {
  const problems: string[] = [];
  checkGateway(problems, "foreignGateway", gateways.foreignGateway);
  checkGateway(problems, "homeGateway", gateways.homeGateway);
  if (problems.length > 0) throw new MainnetConfigError("invalid gateway address", problems);

  const routes = expectedRoutes();
  const reporterRoutes = Object.fromEntries(
    routes.map((route) => [
      route.id,
      {
        costPerMessage: COST_PER_MESSAGE[route.direction][route.bridge],
        lowWaterMessages: REPORTER_DEFAULTS.lowWaterMessages,
        targetMessages: REPORTER_DEFAULTS.targetMessages,
        minTopUpMessages: REPORTER_DEFAULTS.minTopUpMessages,
      },
    ])
  );
  const chainlink = (chain: typeof CHAINS.home | typeof CHAINS.foreign) => ({
    id: "chainlink",
    source: `chainlink:${chain.name}`,
    chainId: chain.id,
    feeds: CHAINLINK_FEEDS[chain.id],
  });

  return {
    _comment:
      "Generated by src/mainnet/cli.ts from the Veashi deploy output, the @kleros/veashi-sdk getters and " +
      "src/mainnet/parameters.ts. Do not edit by hand: change the parameters and regenerate (RUNBOOK, Mainnet launch).",
    topology: {
      chains: [CHAINS.home, CHAINS.foreign],
      pairs: [
        {
          id: PAIR_ID,
          foreignChainId: FOREIGN_CHAIN_ID,
          foreignGateway: getAddress(gateways.foreignGateway),
          homeChainId: HOME_CHAIN_ID,
          homeGateway: getAddress(gateways.homeGateway),
          collectedAssets: [
            { chainId: FOREIGN_CHAIN_ID, address: "native", symbol: "ETH", decimals: 18 },
            { chainId: FOREIGN_CHAIN_ID, ...USDC_BASE },
          ],
          rateCurrency: "USD",
        },
      ],
      routes: routes.map((route) => ({
        id: route.id,
        pairId: PAIR_ID,
        chainId: route.chainId,
        reporter: route.reporter,
        fundingMethod: "nativeTransfer",
      })),
    },
    platform: { gas: { minimumReserveWei: MINIMUM_GAS_RESERVE_WEI } },
    refill: {
      depositMethod: "nativeTransfer",
      pairs: {
        [PAIR_ID]: {
          enabled: true,
          referenceCaseCostEth: REFERENCE_CASE_COST_ETH,
          lowWaterCases: REFILL.lowWaterCases,
          targetCases: REFILL.targetCases,
          economicMinimums: REFILL.economicMinimums,
        },
      },
    },
    lifi: {
      allowedChains: [FOREIGN_CHAIN_ID, HOME_CHAIN_ID],
      allowedAssets: [
        { chainId: FOREIGN_CHAIN_ID, address: "native" },
        { chainId: FOREIGN_CHAIN_ID, address: USDC_BASE.address },
        { chainId: HOME_CHAIN_ID, address: "native" },
      ],
      limits: LIFI_LIMITS,
    },
    reporter: { ...REPORTER_DEFAULTS, routes: reporterRoutes },
    rates: {
      providers: [
        chainlink(CHAINS.home),
        chainlink(CHAINS.foreign),
        { id: "coingecko", baseUrl: "https://api.coingecko.com", ...COINGECKO },
      ],
      minSources: MIN_PRICE_SOURCES,
      pairs: { [PAIR_ID]: { targets: [{ token: USDC_BASE.symbol }] } },
    },
  };
}

/** Source families of the enabled price providers (Chainlink on two chains is one family) and their symbols. */
export function priceFamilies(config: AppConfig): Map<string, Set<string>> {
  const families = new Map<string, Set<string>>();
  for (const provider of config.rates.providers) {
    if (!provider.enabled) continue;
    const symbols = families.get(provider.id) ?? new Set<string>();
    const covered = provider.id === "chainlink" ? Object.keys(provider.feeds) : Object.keys(provider.coinIds);
    covered.forEach((symbol) => symbols.add(symbol));
    families.set(provider.id, symbols);
  }
  return families;
}

function checkRoutes(config: AppConfig, problems: string[]): void {
  const expected = new Map(expectedRoutes().map((route) => [route.id, route]));
  for (const route of config.topology.routes) {
    const wanted = expected.get(route.id);
    if (!wanted) {
      problems.push(`topology.routes: ${route.id} is not one of ${[...expected.keys()].join(", ")}`);
      continue;
    }
    expected.delete(route.id);
    if (route.chainId !== wanted.chainId) {
      problems.push(`topology.routes ${route.id}: chain ${route.chainId}, the SDK reporter is on ${wanted.chainId}`);
    }
    if (route.reporter.toLowerCase() !== wanted.reporter.toLowerCase()) {
      problems.push(
        `topology.routes ${route.id}: reporter ${route.reporter} differs from the SDK getter's ${wanted.reporter}`
      );
    }
    const cost = config.reporter.routes[route.id]?.costPerMessage;
    if (!cost || !/[1-9]/.test(cost)) problems.push(`reporter.routes.${route.id}.costPerMessage is missing or zero`);
  }
  for (const id of expected.keys()) problems.push(`topology.routes: route ${id} is missing`);
}

function checkRates(config: AppConfig, problems: string[]): void {
  const families = priceFamilies(config);
  for (const [family, symbols] of families) {
    for (const symbol of ["ETH", USDC_BASE.symbol]) {
      if (!symbols.has(symbol)) problems.push(`rates.providers: the ${family} family has no ${symbol} price`);
    }
  }
  if (config.rates.minSources > families.size) {
    problems.push(`rates.minSources ${config.rates.minSources} exceeds the ${families.size} enabled source families`);
  }
  const sources = config.rates.providers.map(providerSource);
  if (new Set(sources).size !== sources.length) problems.push("rates.providers: duplicate source");
  const targets = config.rates.pairs[PAIR_ID]?.targets ?? [];
  if (targets.some((target) => target === "homeNative")) {
    problems.push(`rates.pairs.${PAIR_ID}.targets: homeNative is fixed at 1e18 on an ETH/ETH pair, no loop`);
  }
  if (!targets.some((target) => typeof target === "object" && target.token === USDC_BASE.symbol)) {
    problems.push(`rates.pairs.${PAIR_ID}.targets: no USDC target`);
  }
}

/**
 * Validates a mainnet configuration with the bot's full loader (`parseConfig`: schema, topology, secret variable
 * names) and the mainnet checks: deployed (non-placeholder) gateways, exactly the six SDK reporter routes each with
 * a `costPerMessage`, two price families covering ETH and USDC, one USDC rate target and no `homeNative` loop.
 */
export function validateMainnetConfig(raw: unknown): AppConfig {
  const config = parseConfig(raw);
  const problems: string[] = [];
  const pair = config.topology.pairs.find((p) => p.id === PAIR_ID);
  if (!pair || config.topology.pairs.length !== 1)
    problems.push(`topology.pairs: expected exactly the ${PAIR_ID} pair`);
  if (pair) {
    if (pair.foreignChainId !== FOREIGN_CHAIN_ID || pair.homeChainId !== HOME_CHAIN_ID) {
      problems.push(`topology.pairs ${PAIR_ID}: expected foreign ${FOREIGN_CHAIN_ID} and home ${HOME_CHAIN_ID}`);
    }
    checkGateway(problems, `topology.pairs ${PAIR_ID}.foreignGateway`, pair.foreignGateway);
    checkGateway(problems, `topology.pairs ${PAIR_ID}.homeGateway`, pair.homeGateway);
  }
  checkRoutes(config, problems);
  checkRates(config, problems);
  if (problems.length > 0) throw new MainnetConfigError("invalid mainnet configuration", problems);
  return config;
}

/** Builds and validates; nothing is written. */
export function generateMainnetConfig(options: {
  deploymentsDir: string;
  foreignGateway?: string;
  homeGateway?: string;
}): { raw: Record<string, unknown>; config: AppConfig } {
  const raw = buildMainnetConfig(resolveGateways(options));
  return { raw, config: validateMainnetConfig(raw) };
}

export function serializeConfig(raw: unknown): string {
  return `${JSON.stringify(raw, null, 2)}\n`;
}

/** Validates, then writes atomically (temporary file, then rename). */
export function writeMainnetConfig(path: string, raw: unknown): void {
  validateMainnetConfig(raw);
  mkdirSync(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.tmp`;
  writeFileSync(temporary, serializeConfig(raw));
  renameSync(temporary, path);
}
