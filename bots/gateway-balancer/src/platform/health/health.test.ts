import { randomUUID } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { FakeLogger } from "../../testing/fakeLogger";
import { buildPlatform } from "../index";
import { SqliteJournal } from "../journal/sqliteJournal";
import { Redactor } from "../redact";
import { collectStatus, OBSERVATION_GROUPS, startHealthServer, statusJson, type HealthServer } from "./health";

const EXAMPLE = resolve(__dirname, "../../../config/example.json");
const dir = mkdtempSync(join(tmpdir(), "gb-health-"));
const journalPath = join(dir, "journal.sqlite");
const RPC = "https://arb-mainnet.example.io/v2/HEALTHRPCKEY0001";
const KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
const NOW = new Date("2026-01-01T00:00:00Z");

let journal: SqliteJournal;
let server: HealthServer;
const ids: Record<string, string> = {};

beforeAll(async () => {
  journal = SqliteJournal.open(
    journalPath,
    { instanceId: randomUUID(), pid: process.pid, startedAt: NOW, staleAfterMs: 60_000 },
    { redactor: new Redactor([RPC, KEY]), now: () => NOW }
  );
  const observations: Array<[string, unknown]> = [
    ["capacity:arc-arbitrum", { cases: 42n }],
    ["withdrawable:arc-arbitrum:5042002:native", { arbitration: 10n ** 20n, bridging: 5n }],
    ["reporter:arc->arbitrum", { balanceWei: 1n }],
    ["price:ETH", { priceE18: 3000n * 10n ** 18n }],
    ["rate:arc-arbitrum", { rateE18: 1n }],
    ["in-transit:op-1", { amount: 7n }],
    ["transfer-delta:op-1", { deltaWei: -3n }],
    ["gas:42161", { reserveWei: 10n ** 17n, low: false }],
    ["suspended:refill:arc-arbitrum", { reason: `limit hit talking to ${RPC}` }],
    ["misc", "unrelated"],
  ];
  for (const [key, value] of observations) await journal.recordObservation(key, value as never, NOW);
  for (const status of ["open", "attention", "completed"] as const) {
    const op = await journal.createOperation({
      kind: "refill",
      description: status,
      scopes: [],
      pairId: "arc-arbitrum",
      payload: null,
    });
    if (status !== "open")
      await journal.updateOperation(op.id, { status, lastError: status === "attention" ? `rpc ${RPC} gave up` : null });
    ids[status] = op.id;
  }
  const tx = {
    operationId: ids.open!,
    chainId: 42161,
    from: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" as const,
    to: "0x00000000000000000000000000000000000000b1" as const,
    value: 1n,
    data: null,
    nonce: 4,
    hash: "0x01" as const,
    signedRaw: "0x02" as const,
    error: null,
    replacedByHash: null,
    blockNumber: null,
  };
  await journal.recordTransaction({ ...tx, idempotencyKey: "pending-tx", status: "broadcast" });
  await journal.recordTransaction({ ...tx, idempotencyKey: "done-tx", status: "confirmed" });
  await journal.ledger.credit({
    scope: { kind: "arbitration", pairId: "arc-arbitrum" },
    chainId: 42161,
    asset: "native",
    location: "in-transit",
    amount: 10n ** 20n,
    operationId: ids.open!,
    reason: "bridge",
  });
  server = await startHealthServer({ host: "127.0.0.1", port: 0, journal, now: () => NOW, logger: new FakeLogger() });
});

afterAll(async () => {
  await server.close();
  await journal.close();
  rmSync(dir, { recursive: true, force: true });
});

describe("health", () => {
  it("groups observations by prefix and lists open and attention operations and non-final transactions", async () => {
    const snapshot = await collectStatus(journal, NOW);
    for (const group of OBSERVATION_GROUPS) expect(snapshot.observations[group], group).toHaveLength(1);
    expect(snapshot.observations.other.map((o) => o.key)).toEqual(["misc"]);
    expect(snapshot.observations.withdrawable[0]?.value).toEqual({ arbitration: 10n ** 20n, bridging: 5n });
    expect(snapshot.status).toBe("attention");
    expect(snapshot.operations.open.map((o) => o.id)).toEqual([ids.open]);
    expect(snapshot.operations.attention.map((o) => o.id)).toEqual([ids.attention]);
    expect(snapshot.transactions.map((t) => [t.idempotencyKey, t.status, t.nonce])).toEqual([
      ["pending-tx", "broadcast", 4],
    ]);
    expect(snapshot.holdings).toEqual([
      {
        scope: "arbitration:arc-arbitrum",
        chainId: 42161,
        asset: "native",
        location: "in-transit",
        amount: "100000000000000000000",
      },
    ]);
  });

  it("serves GET /healthz as JSON and 404 elsewhere", async () => {
    const response = await fetch(`http://127.0.0.1:${server.port}/healthz`);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/json");
    const body = await response.text();
    expect(JSON.parse(body)).toEqual(JSON.parse(statusJson(await collectStatus(journal, NOW))));
    expect(JSON.parse(body).observations["in-transit"][0].value).toEqual({ amount: "7" });
    expect((await fetch(`http://127.0.0.1:${server.port}/other`)).status).toBe(404);
  });

  it("prints the same from the status command, and neither contains a secret", async () => {
    const config = JSON.parse(readFileSync(EXAMPLE, "utf8")) as Record<string, unknown>;
    const configPath = join(dir, "config.json");
    writeFileSync(configPath, JSON.stringify({ ...config, platform: { journalPath } }));
    const printed: string[] = [];
    const platform = await buildPlatform(
      { GATEWAY_BALANCER_CONFIG: configPath, ARBITRUM_RPC_URL: RPC, BALANCER_PRIVATE_KEY: KEY },
      ["status"],
      {
        stdout: (text) => printed.push(text),
        logWrite: () => undefined,
        clock: { now: () => NOW, sleep: async () => undefined },
      }
    );
    expect(await platform.run([], ["status"])).toBe(0);
    const fromStatus = printed.join("");
    const fromHealth = await (await fetch(`http://127.0.0.1:${server.port}/healthz`)).text();
    expect(JSON.parse(fromStatus)).toEqual(JSON.parse(fromHealth));
    for (const text of [fromStatus, fromHealth]) {
      expect(text).not.toContain("HEALTHRPCKEY0001");
      expect(text).not.toContain("arb-mainnet.example.io");
      expect(text).not.toContain(KEY.slice(2));
      expect(text).not.toContain("signedRaw");
    }
    expect(fromStatus).toContain("[redacted");
  });
});
