import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { zeroAddress } from "viem";
import type { Loop } from "../../domain";
import { createGatewayAdapters } from "../../gateway";
import { createRouteProvider, createTransfers } from "../../lifi";
import type { PriceOracle, RouteProvider, Transfers } from "../../ports";
import { createRatesLoops, createPriceOracle } from "../../rates";
import { createRefillLoops } from "../../refill";
import { createReporterLoops } from "../../reporter";
import type { AppConfigInput } from "../../config/schema";
import { platformConfigSchema } from "../config";
import { createTimedFetch } from "../fetch";
import { createPlatform } from "../index";
import { ConfigError, loadConfig, parseConfig, secretVariableProblems } from "./load";

const EXAMPLE = resolve(__dirname, "../../../config/example.json");
const dir = mkdtempSync(join(tmpdir(), "gb-config-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

const SECRETS = {
  ARBITRUM_RPC_URL: "https://arb-mainnet.example.io/v2/ARBKEY0000000001",
  BASE_RPC_URL: "https://base-mainnet.example.io/v2/BASEKEY000000002",
  ARC_RPC_URL: "https://arc.example.io/rpc?apikey=ARCKEY0000000003",
  BALANCER_PRIVATE_KEY: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
  SLACK_WEBHOOK_URL: "https://hooks.slack.com/services/T0/B0/WEBHOOKSECRET0004",
};

function exampleJson(): Record<string, unknown> {
  return JSON.parse(readFileSync(EXAMPLE, "utf8")) as Record<string, unknown>;
}

let n = 0;
function writeConfig(mutate: (config: AppConfigInput) => void = () => undefined): string {
  const config = exampleJson() as unknown as AppConfigInput;
  mutate(config);
  const path = join(dir, `config-${++n}.json`);
  writeFileSync(path, JSON.stringify(config));
  return path;
}

function errorOf(run: () => unknown): ConfigError {
  try {
    run();
  } catch (error) {
    expect(error).toBeInstanceOf(ConfigError);
    return error as ConfigError;
  }
  throw new Error("expected a ConfigError");
}

const bigints = (_k: string, v: unknown) => (typeof v === "bigint" ? v.toString() : v);

describe("configuration loading", () => {
  it("loads the example with RPC URLs resolved from the variables named by rpcUrlEnv", () => {
    const { config, secrets } = loadConfig({ GATEWAY_BALANCER_CONFIG: EXAMPLE, ...SECRETS }, { requireSecrets: true });
    expect(config.topology.chains.map((c) => c.rpcUrlEnv)).toEqual(["ARBITRUM_RPC_URL", "BASE_RPC_URL", "ARC_RPC_URL"]);
    expect(secrets.rpcUrls.get(42161)).toBe(SECRETS.ARBITRUM_RPC_URL);
    expect(secrets.rpcUrls.get(8453)).toBe(SECRETS.BASE_RPC_URL);
    expect(secrets.rpcUrls.get(5042002)).toBe(SECRETS.ARC_RPC_URL);
    expect(secrets.privateKey).toBe(SECRETS.BALANCER_PRIVATE_KEY);
    // `"platform": {}` takes every default.
    expect(config.platform.executor.waitMs).toBe(45_000);
    expect(config.platform.executor.waitMs).toBeLessThan(60_000);
    expect(config.platform.schedule.stopTimeoutMs).toBeGreaterThan(config.platform.executor.waitMs);
    expect(config.platform.http.timeoutMs).toBe(30_000);
    expect(config.platform.notifications.providers.slack.enabled).toBe(false);
  });

  it("keeps every secret out of the loaded configuration object", () => {
    const { config } = loadConfig({ GATEWAY_BALANCER_CONFIG: EXAMPLE, ...SECRETS }, { requireSecrets: true });
    const text = JSON.stringify(config, bigints);
    for (const secret of Object.values(SECRETS)) expect(text).not.toContain(secret);
    expect(text).not.toContain(SECRETS.BALANCER_PRIVATE_KEY.slice(2));
  });

  it("fails naming a missing variable, never printing a value", () => {
    const env: NodeJS.ProcessEnv = { GATEWAY_BALANCER_CONFIG: EXAMPLE, ...SECRETS };
    delete env.ARC_RPC_URL;
    const error = errorOf(() => loadConfig(env, { requireSecrets: true }));
    expect(error.message).toContain("ARC_RPC_URL");
    for (const secret of Object.values(SECRETS)) expect(error.message).not.toContain(secret);

    const noKey: NodeJS.ProcessEnv = { GATEWAY_BALANCER_CONFIG: EXAMPLE, ...SECRETS };
    delete noKey.BALANCER_PRIVATE_KEY;
    expect(errorOf(() => loadConfig(noKey, { requireSecrets: true })).message).toContain("BALANCER_PRIVATE_KEY");

    const slackOn = writeConfig((c) => (c.platform = { notifications: { providers: { slack: { enabled: true } } } }));
    const noHook: NodeJS.ProcessEnv = { GATEWAY_BALANCER_CONFIG: slackOn, ...SECRETS };
    delete noHook.SLACK_WEBHOOK_URL;
    expect(errorOf(() => loadConfig(noHook, { requireSecrets: true })).message).toContain("SLACK_WEBHOOK_URL");

    const badKey = { GATEWAY_BALANCER_CONFIG: EXAMPLE, ...SECRETS, BALANCER_PRIVATE_KEY: "0xnot-a-key-but-secret" };
    const keyError = errorOf(() => loadConfig(badKey, { requireSecrets: true }));
    expect(keyError.message).toContain("BALANCER_PRIVATE_KEY is not a 32-byte hex private key");
    expect(keyError.message).not.toContain("not-a-key-but-secret");
  });

  it("fails naming the JSON path of an invalid value", () => {
    const badAddress = writeConfig((c) => (c.topology.pairs[1]!.foreignGateway = "0x123" as never));
    expect(
      errorOf(() => loadConfig({ GATEWAY_BALANCER_CONFIG: badAddress }, { requireSecrets: false })).problems
    ).toEqual(["topology.pairs[1].foreignGateway: expected a 0x-prefixed 20-byte hex address"]);
    const badWait = writeConfig((c) => (c.platform = { executor: { waitMs: "soon" as never } }));
    expect(
      errorOf(() => loadConfig({ GATEWAY_BALANCER_CONFIG: badWait }, { requireSecrets: false })).message
    ).toContain("platform.executor.waitMs: Expected number, received string");
    const badGas = writeConfig((c) => (c.platform = { gas: { minimumReserveWei: { "42161": "0.01" as never } } }));
    expect(errorOf(() => loadConfig({ GATEWAY_BALANCER_CONFIG: badGas }, { requireSecrets: false })).message).toContain(
      "platform.gas.minimumReserveWei.42161"
    );
  });

  it("fails the load on validateTopology problems", () => {
    const path = writeConfig((c) => (c.topology.pairs[0]!.homeChainId = 9999));
    expect(errorOf(() => loadConfig({ GATEWAY_BALANCER_CONFIG: path }, { requireSecrets: false })).problems).toContain(
      "pair arc-arbitrum: unknown home chain 9999"
    );
  });

  it("rejects an RPC or webhook variable that names the key's variable or another secret's", () => {
    const keyAsRpc = writeConfig((c) => (c.topology.chains[1]!.rpcUrlEnv = "BALANCER_PRIVATE_KEY"));
    expect(
      errorOf(() => loadConfig({ GATEWAY_BALANCER_CONFIG: keyAsRpc }, { requireSecrets: false })).problems
    ).toEqual(["topology.chains[1].rpcUrlEnv: BALANCER_PRIVATE_KEY is already the variable of the private key"]);
    const keyAsWebhook = writeConfig(
      (c) => (c.platform = { notifications: { providers: { slack: { webhookUrlEnv: "BALANCER_PRIVATE_KEY" } } } })
    );
    expect(
      errorOf(() => loadConfig({ GATEWAY_BALANCER_CONFIG: keyAsWebhook }, { requireSecrets: false })).problems
    ).toEqual([
      "platform.notifications.providers.slack.webhookUrlEnv: BALANCER_PRIVATE_KEY is already the variable of the " +
        "private key",
    ]);
    const rpcAsWebhook = writeConfig(
      (c) => (c.platform = { notifications: { providers: { slack: { webhookUrlEnv: "BASE_RPC_URL" } } } })
    );
    expect(
      errorOf(() => loadConfig({ GATEWAY_BALANCER_CONFIG: rpcAsWebhook }, { requireSecrets: false })).message
    ).toContain("BASE_RPC_URL is already the variable of the RPC URL of chain");
    const sharedRpc = writeConfig((c) => (c.topology.chains[2]!.rpcUrlEnv = c.topology.chains[0]!.rpcUrlEnv));
    expect(
      errorOf(() => loadConfig({ GATEWAY_BALANCER_CONFIG: sharedRpc }, { requireSecrets: false })).problems[0]
    ).toMatch(/^topology\.chains\[2\]\.rpcUrlEnv: /);
    const configPath = writeConfig((c) => (c.topology.chains[0]!.rpcUrlEnv = "GATEWAY_BALANCER_CONFIG"));
    expect(
      errorOf(() => loadConfig({ GATEWAY_BALANCER_CONFIG: configPath }, { requireSecrets: false })).message
    ).toContain("the configuration path");
  });

  it("checks every *Env key of the composed configuration against the secret variables (L33, L38)", () => {
    const config = parseConfig(exampleJson());
    const withRates = (providers: unknown[]) => ({ ...config, rates: { ...config.rates, providers } });
    // A price provider's API key variable equal to a topology RPC variable would send the RPC URL as an API key.
    expect(secretVariableProblems(withRates([{ id: "coingecko", apiKeyEnv: "BASE_RPC_URL" }]))).toEqual([
      "rates.providers[0].apiKeyEnv: BASE_RPC_URL is already the variable of the RPC URL of chain base",
    ]);
    expect(
      secretVariableProblems(
        withRates([
          { id: "a", apiKeyEnv: "BALANCER_PRIVATE_KEY" },
          { id: "b", nested: { tokenEnv: "SLACK_WEBHOOK_URL" } },
          { id: "c", apiKeyEnv: "GATEWAY_BALANCER_CONFIG" },
        ])
      )
    ).toEqual([
      "rates.providers[0].apiKeyEnv: BALANCER_PRIVATE_KEY is already the variable of the private key",
      "rates.providers[1].nested.tokenEnv: SLACK_WEBHOOK_URL is already the variable of the Slack webhook URL",
      "rates.providers[2].apiKeyEnv: GATEWAY_BALANCER_CONFIG is already the variable of the configuration path",
    ]);
    // Non-secret names, even shared between two providers, pass; the topology's own keys are not self-conflicts.
    expect(
      secretVariableProblems(
        withRates([
          { id: "a", apiKeyEnv: "PRICE_API_KEY" },
          { id: "b", apiKeyEnv: "PRICE_API_KEY" },
        ])
      )
    ).toEqual([]);
    // parseConfig applies the check to the composed configuration it loads.
    const keyAsRpc = writeConfig((c) => (c.topology.chains[0]!.rpcUrlEnv = "BALANCER_PRIVATE_KEY"));
    expect(() => loadConfig({ GATEWAY_BALANCER_CONFIG: keyAsRpc }, { requireSecrets: false })).toThrow(
      /topology\.chains\[0\]\.rpcUrlEnv: BALANCER_PRIVATE_KEY/
    );
  });

  it("refuses, through the real loadConfig, a rates apiKeyEnv equal to a topology rpcUrlEnv (L38, L48)", () => {
    const path = writeConfig((c) => {
      (c as { rates: unknown }).rates = { providers: [{ id: "coingecko", apiKeyEnv: "BASE_RPC_URL" }] };
    });
    const error = errorOf(() => loadConfig({ GATEWAY_BALANCER_CONFIG: path, ...SECRETS }, { requireSecrets: true }));
    expect(error.problems).toContain(
      "rates.providers[0].apiKeyEnv: BASE_RPC_URL is already the variable of the RPC URL of chain base"
    );
    for (const secret of Object.values(SECRETS)) expect(error.message).not.toContain(secret);
    // The same check runs when another part of the file is invalid: both are reported.
    const alsoInvalid = writeConfig((c) => {
      (c as { rates: unknown }).rates = { providers: [{ id: "coingecko", apiKeyEnv: "ARC_RPC_URL" }] };
      c.platform = { executor: { waitMs: "soon" as never } };
    });
    const both = errorOf(() => loadConfig({ GATEWAY_BALANCER_CONFIG: alsoInvalid }, { requireSecrets: false }));
    expect(both.problems).toContain(
      "rates.providers[0].apiKeyEnv: ARC_RPC_URL is already the variable of the RPC URL of chain arc"
    );
    expect(both.message).toContain("platform.executor.waitMs");
    // A malformed file is a configuration error, never a crash of the secret-name check.
    for (const raw of [null, 7, { topology: { chains: "x" } }, { topology: { chains: [null] } }]) {
      expect(() => parseConfig(raw)).toThrow(ConfigError);
    }
  });

  it("binds health to loopback unless the configuration opts in to another address", () => {
    const parse = (health: unknown) => platformConfigSchema.safeParse({ health });
    expect(parse({}).data?.health).toMatchObject({ host: "127.0.0.1", allowNonLoopback: false });
    for (const host of ["127.0.0.1", "127.0.0.53", "::1", "localhost"]) expect(parse({ host }).success).toBe(true);
    const exposed = parse({ host: "0.0.0.0" });
    expect(exposed.success).toBe(false);
    expect(exposed.error?.issues[0]?.path).toEqual(["health", "host"]);
    expect(parse({ host: "0.0.0.0", allowNonLoopback: true }).success).toBe(true);
  });

  it("documents every platform default in config/platform.example.json", () => {
    const documented = JSON.parse(
      readFileSync(resolve(__dirname, "../../../config/platform.example.json"), "utf8")
    ) as {
      _comment?: string;
    };
    delete documented._comment;
    expect(platformConfigSchema.parse(documented)).toEqual(platformConfigSchema.parse({}));
  });

  it("rejects an ownership staleness that a live but busy instance could trip", () => {
    const parse = (platform: unknown) => platformConfigSchema.safeParse(platform);
    expect(parse({}).success).toBe(true);
    const tooClose = parse({ ownership: { heartbeatMs: 15_000, staleAfterMs: 30_000 } });
    expect(tooClose.success).toBe(false);
    expect(tooClose.error?.issues[0]?.path).toEqual(["ownership", "staleAfterMs"]);
    // Above 3 x heartbeat but not above waitMs + stopTimeoutMs.
    expect(parse({ ownership: { heartbeatMs: 1_000, staleAfterMs: 90_000 } }).success).toBe(false);
    expect(parse({ ownership: { heartbeatMs: 1_000, staleAfterMs: 106_000 } }).success).toBe(true);
    expect(parse({ executor: { waitMs: 50_000 }, schedule: { stopTimeoutMs: 40_000 } }).success).toBe(false);
    expect(() => parseConfig({ ...exampleJson(), platform: { ownership: { staleAfterMs: 1 } } })).toThrow(
      "platform.ownership.staleAfterMs"
    );
  });
});

describe("ports.fetch", () => {
  it("rejects a hung request at the configured timeout", async () => {
    const hung: typeof globalThis.fetch = (_input, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(init.signal?.reason));
      });
    const started = Date.now();
    const error = (await createTimedFetch(80, hung)("https://example.invalid").catch((e: unknown) => e)) as Error;
    expect(error.name).toBe("TimeoutError");
    expect(Date.now() - started).toBeGreaterThanOrEqual(70);
    expect(Date.now() - started).toBeLessThan(2_000);
  });

  it("keeps the caller's own signal", async () => {
    const seen: AbortSignal[] = [];
    const base: typeof globalThis.fetch = async (_input, init) => {
      seen.push(init!.signal!);
      return new Response("ok");
    };
    const caller = new AbortController();
    await createTimedFetch(10_000, base)("https://example.invalid", { signal: caller.signal });
    caller.abort();
    expect(seen[0]?.aborted).toBe(true);
  });
});

/** A seed stub that throws "not implemented yet" is replaced by an inert one; anything else must not throw. */
function seedOr<T>(make: () => T, stub: T): T {
  try {
    return make();
  } catch (error) {
    if (error instanceof Error && /not implemented yet/.test(error.message)) return stub;
    throw error;
  }
}

describe("status without secrets", () => {
  afterEach(() => vi.restoreAllMocks());

  it("builds inert ports, replays main.ts's factory sequence and prints status", async () => {
    const journalPath = join(dir, "status", "journal.sqlite");
    const path = writeConfig((c) => (c.platform = { journalPath }));
    const platform = await createPlatform({ GATEWAY_BALANCER_CONFIG: path }, ["status"]);
    const { ports } = platform;
    expect(ports.signer).toBe(zeroAddress);
    expect(ports.executor.signer).toBe(zeroAddress);
    expect([...ports.chains.keys()]).toEqual([42161, 8453, 5042002]);
    await expect(ports.chains.get(42161)!.getBlockNumber()).rejects.toThrow("read-only status");
    await expect(
      ports.executor.submit({ chainId: 42161, to: zeroAddress, value: 0n }, { idempotencyKey: "k", operationId: "o" })
    ).rejects.toThrow("read-only status");
    await expect(ports.executor.recover()).rejects.toThrow("read-only status");

    // The frozen composition root's sequence over these ports.
    const priceOracle = createPriceOracle(ports);
    const gateways = createGatewayAdapters(ports);
    const routeProvider = seedOr<RouteProvider>(() => createRouteProvider(ports, { priceOracle }), {
      quote: async () => ({ kind: "no-route", reason: "stub" }),
      status: async () => ({ state: "unknown", detail: "stub" }),
    });
    const transfers = seedOr<Transfers>(() => createTransfers(ports, { routeProvider, priceOracle }), {
      run: async () => ({ status: "deferred", reason: "stub" }),
    });
    const loops: Loop[] = [
      ...createRefillLoops(ports, { gateways, transfers, priceOracle: priceOracle as PriceOracle }),
      ...createReporterLoops(ports, { gateways, transfers, routeProvider }),
      ...createRatesLoops(ports, { priceOracle }),
    ];
    expect(Array.isArray(loops)).toBe(true);

    const written: string[] = [];
    vi.spyOn(process.stdout, "write").mockImplementation((chunk: string | Uint8Array) => {
      written.push(String(chunk));
      return true;
    });
    expect(await platform.run([], ["status"])).toBe(0);
    const status = JSON.parse(written.join("")) as Record<string, unknown>;
    expect(status).toMatchObject({ status: "ok", operations: { open: [], attention: [] }, transactions: [] });
    expect(Object.keys(status.observations as object)).toContain("gas");
  });

  it("derives the signer from the key when present, still without RPC variables", async () => {
    const path = writeConfig((c) => (c.platform = { journalPath: join(dir, "status2", "journal.sqlite") }));
    const platform = await createPlatform(
      { GATEWAY_BALANCER_CONFIG: path, BALANCER_PRIVATE_KEY: SECRETS.BALANCER_PRIVATE_KEY },
      ["status"]
    );
    expect(platform.ports.signer).toBe("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
    await platform.ports.journal.close();
  });

  it("refuses an unknown command", async () => {
    await expect(createPlatform({ GATEWAY_BALANCER_CONFIG: EXAMPLE }, ["deploy"])).rejects.toThrow(
      'unknown command "deploy"'
    );
  });
});
