import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { http } from "viem";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Loop } from "../domain";
import { systemClock } from "./clock";
import { buildPlatform } from "./index";
import { OwnershipConflict, SqliteJournal } from "./journal/sqliteJournal";
import { Redactor } from "./redact";
import { ANVIL_ACCOUNTS, startAnvil, type AnvilInstance } from "./testkit/anvil";

const EXAMPLE = resolve(__dirname, "../../config/example.json");
const dir = mkdtempSync(join(tmpdir(), "gb-platform-"));
let anvil: AnvilInstance;

interface HealthBody {
  observations: { gas: Array<{ value: { low: boolean } }> };
}

beforeAll(async () => {
  anvil = await startAnvil(42161);
});

afterAll(async () => {
  await anvil.stop();
  rmSync(dir, { recursive: true, force: true });
});

function setup(name: string, platform: Record<string, unknown> = {}, fetch?: typeof globalThis.fetch) {
  const journalPath = join(dir, name, "journal.sqlite");
  const config = JSON.parse(readFileSync(EXAMPLE, "utf8")) as Record<string, unknown>;
  const configPath = join(dir, `${name}.json`);
  writeFileSync(configPath, JSON.stringify({ ...config, platform: { journalPath, health: { port: 0 }, ...platform } }));
  // The RPC URLs embed fake keys; the transports override routes every chain to the local anvil.
  const env = {
    GATEWAY_BALANCER_CONFIG: configPath,
    ARBITRUM_RPC_URL: "https://arb.example.io/v2/ARBFAKEKEY000001",
    BASE_RPC_URL: "https://base.example.io/v2/BASEFAKEKEY00002",
    ARC_RPC_URL: "https://arc.example.io/rpc?key=ARCFAKEKEY00003",
    BALANCER_PRIVATE_KEY: ANVIL_ACCOUNTS[1]!.privateKey,
    SLACK_WEBHOOK_URL: "https://hooks.slack.com/services/T0/B0/FAKEKEYWEBHOOK",
  };
  const transport = http(anvil.url, { retryCount: 0 });
  const transports = new Map([42161, 8453, 5042002].map((id) => [id, transport]));
  const logs: string[] = [];
  const printed: string[] = [];
  const build = (command: string) =>
    buildPlatform(env, [command], {
      transports,
      handleSignals: false,
      ...(fetch ? { fetch } : {}),
      logWrite: (line) => logs.push(line),
      stdout: (text) => printed.push(text),
    });
  return { journalPath, env, build, logs, printed };
}

async function until(check: () => Promise<boolean>, timeoutMs = 10_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!(await check())) {
    if (Date.now() > deadline) throw new Error("condition not reached");
    await systemClock.sleep(25);
  }
}

describe("createPlatform start and reconcile", () => {
  it("owns the journal, reconciles, schedules loops and the gas monitor, serves health, stops cleanly", async () => {
    const { build, logs, printed, env } = setup("start");
    const platform = await build("start");
    expect(platform.ports.signer).toBe(ANVIL_ACCOUNTS[1]!.address);

    const ticks: string[] = [];
    const loop: Loop = {
      id: "rate:arc-arbitrum",
      tick: async () => {
        ticks.push("rate");
        return { status: "idle", summary: "nothing" };
      },
    };
    const running = platform.run([loop], ["start"]);
    // A second instance builds (nothing is held before `run`) but its `run` is refused by the owner row.
    await until(async () => platform.healthPort() !== null);
    const second = await build("start");
    await expect(second.run([], ["start"])).rejects.toBeInstanceOf(OwnershipConflict);
    let health: HealthBody = { observations: { gas: [] } };
    await until(async () => {
      const port = platform.healthPort();
      if (port === null) return false;
      health = (await (await fetch(`http://127.0.0.1:${port}/healthz`)).json()) as HealthBody;
      return health.observations.gas.length === 3;
    });
    platform.stop();
    expect(await running).toBe(0);
    expect(ticks.length).toBeGreaterThanOrEqual(1);
    expect(health.observations.gas[0].value.low).toBe(false);

    const output = logs.join("") + printed.join("");
    for (const secret of Object.values(env).filter((v) => v.includes("FAKEKEY") || v.startsWith("0x"))) {
      expect(output).not.toContain(secret);
    }
    expect(output).not.toContain(ANVIL_ACCOUNTS[1]!.privateKey.slice(2));

    // The owner row was released: the next instance starts, and `reconcile` prints its report.
    const next = await build("reconcile");
    expect(await next.run([], ["reconcile"])).toBe(0);
    expect(JSON.parse(printed.join(""))).toMatchObject({
      recovery: { resolved: 0, rebroadcast: 0, unknown: [] },
      attention: [],
    });
  });

  it("takes the owner row in run(), so a factory that throws after createPlatform holds nothing", async () => {
    const { build } = setup("factory-throws");
    const factories = async () => {
      const platform = await build("start");
      // A lane factory of main.ts throws before `run`.
      throw new Error(`factory failed with ${platform.ports.signer}`);
    };
    await expect(factories()).rejects.toThrow(/factory failed/);
    const next = await build("reconcile");
    const started = Date.now();
    expect(await next.run([], ["reconcile"])).toBe(0);
    // At once: no stale-owner wait (staleAfterMs is minutes by default).
    expect(Date.now() - started).toBeLessThan(5_000);
  });

  it("exits with a critical notification when another instance id takes the owner row", async () => {
    const posted: Array<{ url: string; body: string }> = [];
    const slackFetch: typeof globalThis.fetch = async (input, init) => {
      posted.push({ url: String(input), body: String(init?.body) });
      return new Response("ok", { status: 200 });
    };
    const { build, journalPath, env } = setup(
      "lost",
      {
        ownership: { heartbeatMs: 50, staleAfterMs: 3_100 },
        executor: { waitMs: 1_000 },
        schedule: { stopTimeoutMs: 2_000 },
        notifications: { providers: { slack: { enabled: true } } },
      },
      slackFetch
    );
    const platform = await build("start");
    const running = platform.run([], ["start"]);
    await until(async () => platform.healthPort() !== null);
    const { DatabaseSync } = process.getBuiltinModule("node:sqlite");
    const intruder = new DatabaseSync(journalPath);
    intruder.exec("PRAGMA busy_timeout = 5000; UPDATE owner SET instance_id = 'someone-else', heartbeat_at = 0");
    intruder.close();
    expect(await running).toBe(1);
    // Delivered to Slack although the journal now refuses every write of this instance (fencing).
    const lost = posted.filter((p) => p.body.includes("Balancer instance lost journal ownership"));
    expect(lost).toHaveLength(1);
    expect(lost[0]?.url).toBe(env.SLACK_WEBHOOK_URL);
    expect(lost[0]?.body).toContain("CRITICAL");
    const reader = SqliteJournal.openReadOnly(journalPath, { redactor: new Redactor([]) });
    expect(await reader.listNotifications()).toEqual([]);
    expect(reader.owner()?.instanceId).toBe("someone-else");
    await reader.close();
  });
});

describe("createPlatform close-operation", () => {
  const ownership = () => ({ instanceId: "seed", pid: process.pid, startedAt: new Date(), staleAfterMs: 60_000 });

  it("closes one attention operation under ownership, prints it, notifies, and refuses the rest", async () => {
    const posted: string[] = [];
    const slackFetch: typeof globalThis.fetch = async (_input, init) => {
      posted.push(String(init?.body));
      return new Response("ok", { status: 200 });
    };
    const { journalPath, env, logs, printed } = setup(
      "close",
      { notifications: { providers: { slack: { enabled: true } } } },
      slackFetch
    );
    // No key and no RPC variable: the command needs neither.
    const operatorEnv = {
      GATEWAY_BALANCER_CONFIG: env.GATEWAY_BALANCER_CONFIG,
      SLACK_WEBHOOK_URL: env.SLACK_WEBHOOK_URL,
    };
    const errors: string[] = [];
    const command = async (name: "close-operation" | "correct-ledger", argv: string[]) => {
      const platform = await buildPlatform(operatorEnv, [name], {
        fetch: slackFetch,
        logWrite: (line) => logs.push(line),
        stdout: (text) => printed.push(text),
        stderr: (text) => errors.push(text),
      });
      return platform.run([], [name, ...argv]);
    };
    const run = (argv: string[]) => command("close-operation", argv);
    const claimKey = "fg:arc-arbitrum:arbitration:5042002:native";

    // Seed: one operation in attention with a holding, one open child, one open sibling.
    mkdirSync(dirname(journalPath), { recursive: true });
    const seed = SqliteJournal.open(journalPath, ownership(), { redactor: new Redactor([]) });
    const stuck = await seed.createOperation({
      kind: "refill",
      description: "refill arc-arbitrum",
      pairId: "arc-arbitrum",
      scopes: [{ kind: "arbitration", pairId: "arc-arbitrum" }],
      payload: null,
    });
    await seed.updateOperation(stuck.id, { status: "attention", step: "deposit", lastError: "tx 0xabc unknown" });
    await seed.ledger.credit({
      scope: { kind: "arbitration", pairId: "arc-arbitrum" },
      chainId: 42161,
      asset: "native",
      location: "eoa",
      amount: 777n,
      operationId: stuck.id,
      reason: "seed",
    });
    // The withdrawal that went unknown still holds its claim on the pool.
    const claim = await seed.ledger.claim({
      key: claimKey,
      amount: 900n,
      operationId: stuck.id,
      onchainAvailable: 1000n,
    });
    const child = await seed.createOperation({
      kind: "transfer",
      description: "bridge",
      parentId: stuck.id,
      scopes: [{ kind: "arbitration", pairId: "arc-arbitrum" }],
      payload: null,
    });
    const sibling = await seed.createOperation({
      kind: "rate-update",
      description: "rate",
      scopes: [],
      payload: null,
    });

    // While the seed instance owns the journal, the command is refused like `reconcile`.
    await expect(run([stuck.id, "--as", "failed"])).rejects.toBeInstanceOf(OwnershipConflict);
    await seed.close();

    expect(await run([sibling.id, "--as", "failed"])).toBe(2);
    expect(errors.join("")).toMatch(new RegExp(`operation ${sibling.id} is open, not attention`));
    expect(await run(["op-404", "--as", "completed"])).toBe(2);
    expect(await run([stuck.id, "--as", "nope"])).toBe(2);
    expect(printed).toEqual([]);

    // A debit over the holding is refused before anything is written.
    expect(await run([stuck.id, "--as", "failed", "--debit", "arbitration:arc-arbitrum@42161:native=778"])).toBe(2);
    expect(errors.join("")).toMatch(/cannot debit 778 from arbitration:arc-arbitrum on chain 42161/);
    expect(printed).toEqual([]);

    const closeArgv = ["--as", "failed", "--debit", "arbitration:arc-arbitrum@42161:native=77"];
    expect(await run([stuck.id, ...closeArgv, "--note", "reverted at 0xabc; nothing moved"])).toBe(0);
    const output = JSON.parse(printed.join("")) as {
      operation: { id: string; status: string; lastError: string };
      corrections: Array<{ direction: string; amount: string }>;
      releasedClaims: Array<{ id: string; amount: string }>;
      holdings: Array<{ chainId: number; amount: string }>;
      children: Array<{ id: string }>;
    };
    expect(output.corrections).toEqual([expect.objectContaining({ direction: "debit", amount: "77" })]);
    expect(output.releasedClaims).toEqual([{ id: claim.id, key: claimKey, amount: "900" }]);
    expect(output.operation).toMatchObject({ id: stuck.id, status: "failed" });
    expect(output.operation.lastError).toMatch(
      /^closed by the operator as failed at .*: reverted at 0xabc; nothing moved \(was: tx 0xabc unknown\)$/
    );
    expect(output.holdings).toEqual([expect.objectContaining({ chainId: 42161, amount: "700" })]);
    expect(output.children.map((c) => c.id)).toEqual([child.id]);
    expect(posted).toHaveLength(1);
    expect(posted[0]).toContain(`Operation ${stuck.id} closed by the operator as failed with 1 ledger correction`);
    expect(logs.join("")).toContain("operation closed by the operator");

    // Persisted, the ownership released, the ledger and the child untouched; a second close is refused.
    const reader = SqliteJournal.openReadOnly(journalPath, { redactor: new Redactor([]) });
    expect((await reader.getOperation(stuck.id))?.status).toBe("failed");
    expect((await reader.getOperation(child.id))?.status).toBe("open");
    expect(await reader.ledger.holdings({ scope: { kind: "arbitration", pairId: "arc-arbitrum" } })).toEqual([
      expect.objectContaining({ amount: 700n }),
    ]);
    expect(await reader.ledger.openClaims(claimKey)).toEqual([]);
    expect(reader.owner()).toBeUndefined();
    await reader.close();
    expect(await run([stuck.id, "--as", "completed"])).toBe(2);
    expect(errors.join("")).toMatch(new RegExp(`operation ${stuck.id} is failed, not attention`));

    // The withdrawal lands after all: correct-ledger credits it to the closed operation's scope.
    printed.length = 0;
    const late = ["--credit", "arbitration:arc-arbitrum@42161:native=900", "--note", "0xabc landed in block 99"];
    expect(await command("correct-ledger", [stuck.id, ...late])).toBe(0);
    expect(JSON.parse(printed.join(""))).toMatchObject({
      operation: { id: stuck.id, status: "failed" },
      holdings: [expect.objectContaining({ amount: "1600" })],
    });
    expect(posted.at(-1)).toContain(
      `Ledger corrected by the operator for operation ${stuck.id} with 1 ledger correction`
    );
    expect(await command("correct-ledger", [child.id, ...late])).toBe(2);
    expect(errors.join("")).toMatch(new RegExp(`operation ${child.id} is open; correct-ledger is for`));
    for (const secret of Object.values(env).filter((v) => v.includes("FAKEKEY"))) {
      expect(logs.join("") + printed.join("") + errors.join("")).not.toContain(secret);
    }
  });
});
