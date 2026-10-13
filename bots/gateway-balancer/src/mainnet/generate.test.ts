import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { createGatewayAdapters } from "../gateway";
import { assertValidLifiConfig } from "../lifi/validate";
import { loadConfigFile } from "../platform/config/load";
import { createRatesLoops } from "../rates";
import { createRefillLoops } from "../refill";
import { routeThresholds } from "../reporter/config";
import { createReporterLoops } from "../reporter";
import { FakePriceOracle, FakeRouteProvider, FakeTransfers, makeFakePorts } from "../testing";
import { runCli } from "./cli";
import {
  buildMainnetConfig,
  generateMainnetConfig,
  MainnetConfigError,
  priceFamilies,
  serializeConfig,
  validateMainnetConfig,
  writeMainnetConfig,
} from "./generate";
import { DEPLOYMENT_NAMES, PAIR_ID } from "./parameters";
import { sdkDistDirectory } from "./sdk";

const here = dirname(fileURLToPath(import.meta.url));
const botRoot = join(here, "..", "..");
const repoRoot = join(botRoot, "..", "..");
const FIXTURE_DEPLOYMENTS = join(here, "fixtures", "deployments");
const FIXTURE_FOREIGN = JSON.parse(
  readFileSync(join(FIXTURE_DEPLOYMENTS, "base", "VeashiForeignGateway.json"), "utf8")
);
const FIXTURE_HOME = JSON.parse(readFileSync(join(FIXTURE_DEPLOYMENTS, "arbitrum", "VeashiHomeGateway.json"), "utf8"));

/** The SDK's route files, read directly: an oracle independent of the getters the generator calls. */
function sdkRouteFile(source: number, destination: number): Record<string, string> {
  return JSON.parse(readFileSync(join(sdkDistDirectory(), "addresses", `${source}-${destination}.json`), "utf8"));
}

const temporary: string[] = [];
function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "mainnet-config-"));
  temporary.push(dir);
  return dir;
}
afterEach(() => {
  while (temporary.length > 0) rmSync(temporary.pop()!, { recursive: true, force: true });
});

function generated() {
  return generateMainnetConfig({ deploymentsDir: FIXTURE_DEPLOYMENTS });
}

function expectRejected(fn: () => unknown, pattern: RegExp): void {
  let error: unknown;
  try {
    fn();
  } catch (caught) {
    error = caught;
  }
  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toMatch(pattern);
}

describe("mainnet configuration generator", () => {
  it("writes a file the bot's full configuration loader and every lane accept", () => {
    const out = join(tempDir(), "config", "mainnet.json");
    writeMainnetConfig(out, generated().raw);
    const config = loadConfigFile(out);

    expect(() => assertValidLifiConfig(config.lifi, config.topology)).not.toThrow();
    const ports = makeFakePorts(config);
    const gateways = createGatewayAdapters(ports);
    const priceOracle = new FakePriceOracle();
    const ids = [
      ...createRefillLoops(ports, { gateways, transfers: new FakeTransfers(), priceOracle }),
      ...createReporterLoops(ports, {
        gateways,
        transfers: new FakeTransfers(),
        routeProvider: new FakeRouteProvider(),
      }),
      ...createRatesLoops(ports, { priceOracle }),
    ].map((loop) => loop.id);
    expect(ids.filter((id) => id.startsWith("reporter:"))).toHaveLength(6);
    expect(ids).toContain(`rate:${PAIR_ID}:USDC`);
    expect(ids.some((id) => id.endsWith(":homeNative"))).toBe(false);
  });

  it("has six reporter routes whose addresses equal the SDK's, each with a costPerMessage", () => {
    const { config } = generated();
    const baseToArbitrum = sdkRouteFile(8453, 42161);
    const arbitrumToBase = sdkRouteFile(42161, 8453);
    const expected = {
      "base->arbitrum:ccip": [8453, baseToArbitrum.ccipReporter],
      "base->arbitrum:lz": [8453, baseToArbitrum.lzReporter],
      "base->arbitrum:axelar": [8453, baseToArbitrum.axelarReporter],
      "arbitrum->base:ccip": [42161, arbitrumToBase.ccipReporter],
      "arbitrum->base:lz": [42161, arbitrumToBase.lzReporter],
      "arbitrum->base:axelar": [42161, arbitrumToBase.axelarReporter],
    };
    expect(Object.fromEntries(config.topology.routes.map((r) => [r.id, [r.chainId, r.reporter]]))).toEqual(expected);
    for (const route of config.topology.routes) {
      expect(route.fundingMethod).toBe("nativeTransfer");
      const chain = config.topology.chains.find((c) => c.id === route.chainId)!;
      const thresholds = routeThresholds(config.reporter, route, chain);
      expect(thresholds, route.id).toBeDefined();
      expect(thresholds!.costPerMessage > 0n).toBe(true);
    }
  });

  it("sets small explicit message thresholds per route, never the reporter defaults ([L3])", () => {
    const { raw, config } = generated();
    const routes = (raw.reporter as { routes: Record<string, Record<string, unknown>> }).routes;
    for (const route of config.topology.routes) {
      const settings = routes[route.id];
      expect(Object.keys(settings).sort()).toEqual(
        ["costPerMessage", "lowWaterMessages", "minTopUpMessages", "targetMessages"].sort()
      );
      const { lowWaterMessages, targetMessages, minTopUpMessages } = settings as Record<string, number>;
      expect(targetMessages).toBeLessThanOrEqual(10);
      expect(targetMessages).toBeGreaterThan(lowWaterMessages);
      expect(minTopUpMessages).toBeLessThan(targetMessages - lowWaterMessages + 1);
    }
  });

  it("takes the pair's gateway addresses from the recorded deploy output", () => {
    const { config } = generated();
    expect(config.topology.pairs).toHaveLength(1);
    const pair = config.topology.pairs[0];
    expect(pair).toMatchObject({ id: PAIR_ID, foreignChainId: 8453, homeChainId: 42161 });
    expect(pair.foreignGateway).toBe(FIXTURE_FOREIGN.address);
    expect(pair.homeGateway).toBe(FIXTURE_HOME.address);
  });

  it("collects ETH and USDC on Base, keeps one USDC rate target and no homeNative loop", () => {
    const { config } = generated();
    const pair = config.topology.pairs[0];
    expect(pair.collectedAssets).toEqual([
      { chainId: 8453, address: "native", symbol: "ETH", decimals: 18 },
      { chainId: 8453, address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", symbol: "USDC", decimals: 6 },
    ]);
    expect(config.rates.pairs[PAIR_ID].targets).toEqual([{ token: "USDC" }]);
    expect(JSON.stringify(config.rates)).not.toContain("homeNative");
    expect(config.topology.chains.map((c) => [c.id, c.rpcUrlEnv, c.wrappedNative])).toEqual([
      [42161, "ARBITRUM_RPC_URL", "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"],
      [8453, "BASE_RPC_URL", "0x4200000000000000000000000000000000000006"],
    ]);
  });

  it("prices from two enabled families covering ETH and USDC, with minSources equal to their count ([L9])", () => {
    const { config } = generated();
    const families = priceFamilies(config);
    expect([...families.keys()].sort()).toEqual(["chainlink", "coingecko"]);
    for (const symbols of families.values()) expect([...symbols].sort()).toEqual(["ETH", "USDC"]);
    expect(config.rates.minSources).toBe(families.size);
    const chainlink = config.rates.providers.filter((p) => p.id === "chainlink");
    expect(chainlink.map((p) => (p.id === "chainlink" ? p.chainId : 0)).sort((a, b) => a - b)).toEqual([8453, 42161]);
    for (const provider of chainlink) {
      if (provider.id !== "chainlink") continue;
      for (const symbol of ["ETH", "USDC"]) {
        const feed = provider.feeds[symbol];
        expect(typeof feed === "object" && feed.freshnessSeconds! > 0, `${provider.source} ${symbol}`).toBe(true);
      }
    }
    const coingecko = config.rates.providers.find((p) => p.id === "coingecko");
    expect(coingecko).toMatchObject({ id: "coingecko", apiKeyEnv: "COINGECKO_API_KEY", enabled: true });
  });

  it("matches the committed config/mainnet.example.json byte for byte", () => {
    const committed = readFileSync(join(botRoot, "config", "mainnet.example.json"), "utf8");
    expect(committed).toBe(serializeConfig(generated().raw));
  });

  it("lists config/mainnet.json in the bot's .gitignore", () => {
    const lines = readFileSync(join(botRoot, ".gitignore"), "utf8").split(/\r?\n/);
    expect(lines).toContain("config/mainnet.json");
  });
});

describe("deploy output", () => {
  it("names the missing deploy-output file", () => {
    const dir = tempDir();
    cpSync(join(FIXTURE_DEPLOYMENTS, "base"), join(dir, "base"), { recursive: true });
    const missing = join(dir, "arbitrum", "VeashiHomeGateway.json");
    expectRejected(
      () => generateMainnetConfig({ deploymentsDir: dir }),
      new RegExp(missing.replace(/[/\\.]/g, "\\$&"))
    );
  });

  it("reads exactly the Veashi deployment names the deploy scripts write", () => {
    const shared = JSON.parse(
      readFileSync(join(repoRoot, "contracts", "deploy", "utils", "veashi", "deploymentNames.json"), "utf8")
    );
    expect(DEPLOYMENT_NAMES).toEqual(shared);

    // A generic ForeignGateway/HomeGateway artifact (another deployment) is never picked up.
    const dir = tempDir();
    cpSync(FIXTURE_DEPLOYMENTS, dir, { recursive: true });
    rmSync(join(dir, "base", "VeashiForeignGateway.json"));
    writeFileSync(join(dir, "base", "ForeignGateway.json"), JSON.stringify({ address: FIXTURE_HOME.address }));
    expectRejected(() => generateMainnetConfig({ deploymentsDir: dir }), /base\/VeashiForeignGateway\.json/);
  });

  it("refuses a deploy output recorded on another chain", () => {
    const dir = tempDir();
    cpSync(FIXTURE_DEPLOYMENTS, dir, { recursive: true });
    writeFileSync(join(dir, "arbitrum", ".chainId"), "421614");
    expectRejected(() => generateMainnetConfig({ deploymentsDir: dir }), /expected chain id 42161, found 421614/);
  });

  it("uses an explicit gateway flag instead of the deploy-output file of its side", () => {
    const dir = tempDir();
    const flag = "0x1234567890AbcdEF1234567890aBcdef12345678";
    cpSync(join(FIXTURE_DEPLOYMENTS, "base"), join(dir, "base"), { recursive: true });
    const { config } = generateMainnetConfig({ deploymentsDir: dir, homeGateway: flag });
    expect(config.topology.pairs[0].homeGateway.toLowerCase()).toBe(flag.toLowerCase());
    expect(config.topology.pairs[0].foreignGateway).toBe(FIXTURE_FOREIGN.address);
  });
});

describe("mainnet configuration rejections ([O14])", () => {
  it.each([
    ["zero", "0x0000000000000000000000000000000000000000"],
    ["burn", "0x000000000000000000000000000000000000dEaD"],
    ["repeated digit", "0x1111111111111111111111111111111111111111"],
  ])("rejects a %s placeholder gateway address", (_, address) => {
    expectRejected(
      () => generateMainnetConfig({ deploymentsDir: FIXTURE_DEPLOYMENTS, foreignGateway: address }),
      /foreignGateway: .* is a placeholder/
    );
    const raw = structuredClone(generated().raw) as { topology: { pairs: Array<Record<string, string>> } };
    raw.topology.pairs[0].homeGateway = address;
    expectRejected(() => validateMainnetConfig(raw), /homeGateway: .* is a placeholder/);
  });

  it("rejects a reporter address that differs from the SDK getter for its route", () => {
    const raw = structuredClone(generated().raw) as { topology: { routes: Array<Record<string, string>> } };
    const route = raw.topology.routes.find((r) => r.id === "arbitrum->base:lz")!;
    route.reporter = sdkRouteFile(42161, 8453).ccipReporter;
    expectRejected(() => validateMainnetConfig(raw), /arbitrum->base:lz: reporter .* differs from the SDK getter/);
  });

  it("rejects a route without costPerMessage", () => {
    const raw = structuredClone(generated().raw) as { reporter: { routes: Record<string, Record<string, unknown>> } };
    delete raw.reporter.routes["base->arbitrum:axelar"].costPerMessage;
    expectRejected(() => validateMainnetConfig(raw), /reporter\.routes\.base->arbitrum:axelar\.costPerMessage/);
  });

  it("rejects a missing route, a homeNative target and minSources above the enabled families", () => {
    const raw = structuredClone(generated().raw) as {
      topology: { routes: Array<Record<string, string>> };
      rates: { minSources: number; pairs: Record<string, { targets: unknown[] }> };
    };
    raw.topology.routes = raw.topology.routes.filter((r) => r.id !== "base->arbitrum:ccip");
    raw.rates.pairs[PAIR_ID].targets.push("homeNative");
    raw.rates.minSources = 3;
    let error: unknown;
    try {
      validateMainnetConfig(raw);
    } catch (caught) {
      error = caught;
    }
    expect(error).toBeInstanceOf(MainnetConfigError);
    const problems = (error as MainnetConfigError).problems.join("\n");
    expect(problems).toMatch(/route base->arbitrum:ccip is missing/);
    expect(problems).toMatch(/targets: homeNative/);
    expect(problems).toMatch(/minSources 3 exceeds the 2 enabled source families/);
  });

  it("rejects an invalid section through the bot's loader", () => {
    const raw = structuredClone(generated().raw) as { reporter: Record<string, unknown> };
    raw.reporter.targetMessages = 1;
    expectRejected(() => validateMainnetConfig(raw), /targetMessages must exceed lowWaterMessages/);
  });

  it("builds nothing for a malformed gateway flag", () => {
    expectRejected(
      () => buildMainnetConfig({ foreignGateway: "0x1234", homeGateway: FIXTURE_HOME.address }),
      /not an address/
    );
  });
});

describe("mainnet configuration CLI", () => {
  it("writes the validated file to --out", () => {
    const out = join(tempDir(), "mainnet.json");
    const lines: string[] = [];
    const code = runCli(
      ["--deployments", FIXTURE_DEPLOYMENTS, "--out", out],
      (l) => lines.push(l),
      (l) => lines.push(l)
    );
    expect(code).toBe(0);
    expect(readFileSync(out, "utf8")).toBe(serializeConfig(generated().raw));
  });

  it("prints with --check and writes nothing", () => {
    const out = join(tempDir(), "mainnet.json");
    const lines: string[] = [];
    const code = runCli(
      ["--deployments", FIXTURE_DEPLOYMENTS, "--out", out, "--check"],
      (l) => lines.push(l),
      () => {}
    );
    expect(code).toBe(0);
    expect(JSON.parse(lines.join("\n"))).toEqual(generated().raw);
    expect(existsSync(out)).toBe(false);
  });

  it("exits 1 naming the missing file and writes nothing", () => {
    const dir = tempDir();
    const out = join(dir, "mainnet.json");
    const errors: string[] = [];
    const code = runCli(
      ["--deployments", join(dir, "none"), "--out", out],
      () => {},
      (l) => errors.push(l)
    );
    expect(code).toBe(1);
    expect(errors.join("\n")).toContain(join(dir, "none", "base", "VeashiForeignGateway.json"));
    expect(existsSync(out)).toBe(false);
  });

  it("exits 2 on an unknown argument", () => {
    expect(
      runCli(
        ["--network", "base"],
        () => {},
        () => {}
      )
    ).toBe(2);
  });
});
