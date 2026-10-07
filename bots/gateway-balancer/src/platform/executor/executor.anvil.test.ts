import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { custom, http, HttpRequestError, keccak256, parseTransaction, type Transport } from "viem";
import { generatePrivateKey, privateKeyToAccount, type PrivateKeyAccount } from "viem/accounts";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import type { Address, Hex, Notification, TxRequest } from "../../domain";
import type { Clock, Notifier, SubmitOutcome } from "../../ports";
import { FakeJournal } from "../../testing/fakeJournal";
import { FakeLogger } from "../../testing/fakeLogger";
import { FakeNotifier } from "../../testing/fakeNotifier";
import { systemClock } from "../clock";
import { readGasReserve } from "../gas/reserve";
import { SqliteJournal, type Ownership } from "../journal/sqliteJournal";
import { PlatformNotifier, type NotificationProvider } from "../notify/notifier";
import { reconcile } from "../reconcile/reconcile";
import { Redactor } from "../redact";
import { ANVIL_ACCOUNTS, REVERTING_RUNTIME, REVERT_SELECTOR, startAnvil, type AnvilInstance } from "../testkit/anvil";
import { PlatformExecutor, withBuffer, type ExecutorOptions } from "./executor";
import { ViemExecutorRpc } from "./rpc";

const CHAIN_ID = 31337;
const REVERTER: Address = "0x00000000000000000000000000000000000000ee";
const RECIPIENT: Address = "0x00000000000000000000000000000000000000cc";
const account = privateKeyToAccount(ANVIL_ACCOUNTS[0]!.privateKey);
const SIGNER = account.address;

/** Wall clock with an adjustable offset, to age records without waiting. */
class OffsetClock implements Clock {
  offsetMs = 0;
  now(): Date {
    return new Date(Date.now() + this.offsetMs);
  }
  sleep(ms: number, signal?: AbortSignal): Promise<void> {
    return systemClock.sleep(ms, signal);
  }
}

let anvil: AnvilInstance;
let opId = 0;

beforeAll(async () => {
  anvil = await startAnvil(CHAIN_ID);
  await anvil.rpc("anvil_setCode", [REVERTER, REVERTING_RUNTIME]);
});

afterAll(async () => {
  await anvil.stop();
});

afterEach(async () => {
  await anvil.rpc("evm_setAutomine", [true]);
  await anvil.rpc("evm_mine");
});

interface Harness {
  executor: PlatformExecutor;
  journal: FakeJournal;
  notifier: FakeNotifier;
  clock: OffsetClock;
  controller: AbortController;
}

function harness(
  overrides: {
    transport?: Transport;
    confirmations?: number;
    options?: Partial<ExecutorOptions>;
    journal?: FakeJournal;
    notifier?: FakeNotifier;
    /** Another notifier for the executor (a `PlatformNotifier` with deduplication). */
    notifyThrough?: Notifier;
    account?: PrivateKeyAccount;
    chainId?: number;
    /** Another node (a second anvil) for the configured chain. */
    url?: string;
  } = {}
): Harness {
  const journal = overrides.journal ?? new FakeJournal();
  const notifier = overrides.notifier ?? new FakeNotifier();
  const clock = new OffsetClock();
  const controller = new AbortController();
  const redact = new Redactor([overrides.url ?? anvil.url]).text;
  const transport = overrides.transport ?? http(overrides.url ?? anvil.url, { retryCount: 0 });
  const executor = new PlatformExecutor({
    account: overrides.account ?? account,
    chains: new Map([
      [
        overrides.chainId ?? CHAIN_ID,
        {
          chainId: overrides.chainId ?? CHAIN_ID,
          name: "anvil",
          confirmations: overrides.confirmations ?? 1,
          rpc: new ViemExecutorRpc(transport, redact, CHAIN_ID),
        },
      ],
    ]),
    journal,
    clock,
    logger: new FakeLogger(),
    notifier: overrides.notifyThrough ?? notifier,
    redact,
    signal: controller.signal,
    options: {
      waitMs: 5_000,
      pollIntervalMs: 50,
      stuckAfterMs: 3_600_000,
      baseFeeMultiplier: 2,
      gasLimitBufferPercent: 20,
      replayMaxAttempts: 5,
      replayMaxAgeMs: 600_000,
      ...overrides.options,
    },
  });
  return { executor, journal, notifier, clock, controller };
}

/**
 * A transport to anvil that fails every request while `down` is set (an unreachable or failing node); with
 * `downAfterBroadcast` it goes down right after forwarding the next `eth_sendRawTransaction`.
 */
function switchable(): { transport: Transport; down: boolean; downAfterBroadcast: boolean } {
  const inner = http(anvil.url, { retryCount: 0 })({ retryCount: 0 });
  const state = {
    down: false,
    downAfterBroadcast: false,
    transport: custom(
      {
        async request({ method, params }: { method: string; params?: unknown }) {
          if (state.down) throw new Error(`connect ECONNREFUSED ${anvil.url}`);
          const result = await inner.request({ method, params } as never);
          if (method === "eth_sendRawTransaction" && state.downAfterBroadcast) state.down = true;
          return result;
        },
      },
      { retryCount: 0 }
    ),
  };
  return state;
}

/** A transport that forwards to anvil but makes `eth_sendRawTransaction` throw (after forwarding, or instead). */
function flakyBroadcast(forward: boolean): Transport {
  const inner = http(anvil.url, { retryCount: 0 })({ retryCount: 0 });
  return custom(
    {
      async request({ method, params }: { method: string; params?: unknown }) {
        if (method === "eth_sendRawTransaction") {
          if (forward) await inner.request({ method, params } as never);
          throw new Error(`socket hang up talking to ${anvil.url}`);
        }
        return inner.request({ method, params } as never);
      },
    },
    { retryCount: 0 }
  );
}

/**
 * A transport to anvil whose reads stall for `delayMs` (a slow node) once `slow` is set, or right after the next
 * `eth_sendRawTransaction` with `slowAfterBroadcast`. The stalled request completes later; nothing waits for it.
 */
function slowable(delayMs = 4_000): { transport: Transport; slow: boolean; slowAfterBroadcast: boolean } {
  const inner = http(anvil.url, { retryCount: 0 })({ retryCount: 0 });
  const state = {
    slow: false,
    slowAfterBroadcast: false,
    transport: custom(
      {
        async request({ method, params }: { method: string; params?: unknown }) {
          if (state.slow) await systemClock.sleep(delayMs);
          const result = await inner.request({ method, params } as never);
          if (method === "eth_sendRawTransaction" && state.slowAfterBroadcast) state.slow = true;
          return result;
        },
      },
      { retryCount: 0 }
    ),
  };
  return state;
}

function key(): { idempotencyKey: string; operationId: string } {
  opId += 1;
  return { idempotencyKey: `op:op-${opId}:step:send`, operationId: `op-${opId}` };
}

const transfer = (value = 1_000n): TxRequest => ({ chainId: CHAIN_ID, to: RECIPIENT, value });

async function nonce(tag: "latest" | "pending" = "latest"): Promise<number> {
  return Number(await anvil.rpc<Hex>("eth_getTransactionCount", [SIGNER, tag]));
}

async function sendOutOfBand(atNonce: number): Promise<Hex> {
  const raw = await account.signTransaction({
    chainId: CHAIN_ID,
    type: "eip1559",
    to: SIGNER,
    value: 0n,
    nonce: atNonce,
    gas: 21_000n,
    maxFeePerGas: 50_000_000_000n,
    maxPriorityFeePerGas: 2_000_000_000n,
  });
  const hash = await anvil.rpc<Hex>("eth_sendRawTransaction", [raw]);
  await mined(hash);
  return hash;
}

/** Anvil's automine is asynchronous: wait until the receipt exists. */
async function mined(hash: Hex): Promise<void> {
  for (let i = 0; i < 100; i++) {
    if (await anvil.rpc("eth_getTransactionReceipt", [hash])) return;
    await systemClock.sleep(20);
  }
  throw new Error(`not mined: ${hash}`);
}

function allErrors(h: Harness, outcomes: unknown[]): string {
  return JSON.stringify(
    { records: [...h.journal.transactions.values()].map((r) => r.error), outcomes },
    (_k, v: unknown) => (typeof v === "bigint" ? v.toString() : v)
  );
}

describe("PlatformExecutor against anvil", () => {
  it("gives two concurrent submits on one chain consecutive nonces; both confirm", async () => {
    const h = harness();
    const start = await nonce("pending");
    const [a, b] = await Promise.all([h.executor.submit(transfer(), key()), h.executor.submit(transfer(), key())]);
    expect(a.status).toBe("confirmed");
    expect(b.status).toBe("confirmed");
    const nonces = [...h.journal.transactions.values()].map((r) => r.nonce).sort();
    expect(nonces).toEqual([start, start + 1]);
    expect(await nonce()).toBe(start + 2);
  });

  it("fails a refused simulation with revertData, holds no nonce, never retries; next submit reuses it", async () => {
    const h = harness();
    const start = await nonce("pending");
    const k = key();
    const failed = await h.executor.submit({ chainId: CHAIN_ID, to: REVERTER, value: 0n, data: "0x12" }, k);
    expect(failed.status).toBe("failed");
    expect(failed.status === "failed" && failed.error).toMatch(new RegExp(`revertData=${REVERT_SELECTOR}$`));
    const record = await h.journal.getTransaction(k.idempotencyKey);
    expect(record?.nonce).toBeNull();
    expect(record?.status).toBe("failed");

    // The same key returns the recorded failure without sending anything.
    const again = await h.executor.submit(transfer(), k);
    expect(again).toEqual(failed);
    expect(await nonce("pending")).toBe(start);

    const next = key();
    expect((await h.executor.submit(transfer(), next)).status).toBe("confirmed");
    expect((await h.journal.getTransaction(next.idempotencyKey))?.nonce).toBe(start);
  });

  it("skips simulation when gas is set and records an on-chain revert with the replayed revertData", async () => {
    const h = harness();
    const k = key();
    const outcome = await h.executor.submit(
      { chainId: CHAIN_ID, to: REVERTER, value: 0n, data: "0x12", gas: 60_000n },
      k
    );
    expect(outcome.status).toBe("reverted");
    expect(outcome.status === "reverted" && outcome.reason).toMatch(new RegExp(`revertData=${REVERT_SELECTOR}$`));
    const record = await h.journal.getTransaction(k.idempotencyKey);
    expect(record?.status).toBe("reverted");
    expect(record?.error).toMatch(new RegExp(`revertData=${REVERT_SELECTOR}$`));
    expect(record?.blockNumber).not.toBeNull();
  });

  it("keeps a broadcast whose transport threw after forwarding non-failed, then resolve() confirms it", async () => {
    const h = harness({ transport: flakyBroadcast(true), options: { waitMs: 300 } });
    await anvil.rpc("evm_setAutomine", [false]);
    const start = await nonce("latest");
    const k = key();
    const outcome = await h.executor.submit(transfer(), k);
    expect(outcome.status).toBe("pending");
    const record = await h.journal.getTransaction(k.idempotencyKey);
    expect(["signed", "broadcast"]).toContain(record?.status);
    await anvil.rpc("evm_mine");
    const resolved = await h.executor.resolve(k.idempotencyKey);
    expect(resolved?.status).toBe("confirmed");
    expect(await nonce("latest")).toBe(start + 1);
    expect(allErrors(h, [outcome, resolved])).not.toContain(anvil.url.replace("http://", ""));
  });

  it("sends one transaction for one idempotency key, concurrently or repeated", async () => {
    const h = harness();
    const start = await nonce("pending");
    const k = key();
    const [a, b] = await Promise.all([h.executor.submit(transfer(), k), h.executor.submit(transfer(), k)]);
    const c = await h.executor.submit(transfer(), k);
    expect(a.status).toBe("confirmed");
    expect(b).toEqual(a);
    expect(c.status).toBe("confirmed");
    expect(await nonce("pending")).toBe(start + 1);
  });

  it("rebroadcasts a record the node forgot while its nonce is free, and warns once when it is old", async () => {
    const h = harness({ options: { waitMs: 200, stuckAfterMs: 600_000 } });
    await anvil.rpc("evm_setAutomine", [false]);
    const k = key();
    const first = await h.executor.submit(transfer(), k);
    expect(first.status).toBe("pending");
    const hash = (first as { hash: Hex }).hash;
    await anvil.rpc("anvil_dropTransaction", [hash]);
    expect(await anvil.rpc("eth_getTransactionByHash", [hash])).toBeNull();

    expect((await h.executor.resolve(k.idempotencyKey))?.status).toBe("pending");
    expect(await anvil.rpc("eth_getTransactionByHash", [hash])).not.toBeNull();
    expect(h.notifier.sent).toEqual([]);

    h.clock.offsetMs = 700_000;
    await h.executor.resolve(k.idempotencyKey);
    await h.executor.resolve(k.idempotencyKey);
    const warnings = h.notifier.sent.filter((n) => n.dedupKey === `tx-stuck:${k.idempotencyKey}`);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]?.severity).toBe("warning");
    const record = await h.journal.getTransaction(k.idempotencyKey);
    expect(warnings[0]?.title).toContain(`nonce ${record?.nonce}`);
    expect(warnings[0]?.body).toContain("0 later transaction(s)");
    expect(warnings[0]?.chainId).toBe(CHAIN_ID);

    await anvil.rpc("evm_mine");
    expect((await h.executor.resolve(k.idempotencyKey))?.status).toBe("confirmed");
  });

  it("recovers the crash window: a signed, unbroadcast record is rebroadcast and confirmed by recover()", async () => {
    const journal = new FakeJournal();
    const crashed = harness({ journal, transport: flakyBroadcast(false), options: { waitMs: 200 } });
    const start = await nonce("latest");
    const k = key();
    const outcome = await crashed.executor.submit(transfer(), k);
    expect(outcome.status).toBe("pending");
    expect((await journal.getTransaction(k.idempotencyKey))?.status).toBe("signed");
    expect(await nonce("latest")).toBe(start);

    const restarted = harness({ journal });
    const report = await restarted.executor.recover();
    expect(report).toEqual({ resolved: 1, rebroadcast: 1, unknown: [] });
    expect((await journal.getTransaction(k.idempotencyKey))?.status).toBe("confirmed");
    expect(await nonce("latest")).toBe(start + 1);
  });

  it("declares replaced only once another tx consumed the nonce confirmations deep; never duplicates", async () => {
    const journal = new FakeJournal();
    const h = harness({ journal, transport: flakyBroadcast(false), confirmations: 3, options: { waitMs: 100 } });
    const k = key();
    await h.executor.submit(transfer(), k);
    const record = await journal.getTransaction(k.idempotencyKey);
    expect(record?.status).toBe("signed");
    const other = await sendOutOfBand(record!.nonce!);

    // Consumed on latest only, not yet `confirmations` deep: pending in every mode, never unknown.
    expect((await h.executor.resolve(k.idempotencyKey))?.status).toBe("pending");
    const healthy = harness({ journal, confirmations: 3 });
    expect(await healthy.executor.recover()).toEqual({ resolved: 0, rebroadcast: 0, unknown: [] });
    expect((await journal.getTransaction(k.idempotencyKey))?.status).toBe("signed");
    expect((await healthy.executor.resolve(k.idempotencyKey))?.status).toBe("pending");

    await anvil.rpc("evm_mine");
    await anvil.rpc("evm_mine");
    const outcome = await healthy.executor.resolve(k.idempotencyKey);
    expect(outcome).toEqual({ status: "replaced", hash: record!.hash, replacedByHash: null });
    expect((await journal.getTransaction(k.idempotencyKey))?.status).toBe("replaced");
    expect(await anvil.rpc("eth_getTransactionByHash", [record!.hash])).toBeNull();
    expect(await anvil.rpc("eth_getTransactionByHash", [other])).not.toBeNull();
    expect(await nonce("latest")).toBe(record!.nonce! + 1);
  });

  it("returns pending within waitMs with automine off, and resolve() confirms after mining", async () => {
    const h = harness({ options: { waitMs: 400 } });
    await anvil.rpc("evm_setAutomine", [false]);
    const k = key();
    const started = Date.now();
    const outcome = await h.executor.submit(transfer(), k);
    const elapsed = Date.now() - started;
    expect(outcome.status).toBe("pending");
    expect(elapsed).toBeGreaterThanOrEqual(350);
    expect(elapsed).toBeLessThan(3_000);
    await anvil.rpc("evm_mine");
    expect((await h.executor.resolve(k.idempotencyKey))?.status).toBe("confirmed");
  });

  it("returns from the confirmation wait as soon as the shutdown signal aborts", async () => {
    const h = harness({ options: { waitMs: 50_000 } });
    await anvil.rpc("evm_setAutomine", [false]);
    const started = Date.now();
    setTimeout(() => h.controller.abort(), 200);
    const outcome = await h.executor.submit(transfer(), key());
    expect(outcome.status).toBe("pending");
    expect(Date.now() - started).toBeLessThan(3_000);
  });

  it("keeps a record pending, never unknown, when the client fails mid-wait; resolve() settles it later", async () => {
    const node = switchable();
    const h = harness({ transport: node.transport, options: { waitMs: 600 } });
    await anvil.rpc("evm_setAutomine", [false]);
    const k = key();
    node.downAfterBroadcast = true;
    const outcome = await h.executor.submit(transfer(), k);
    expect(node.down).toBe(true);
    expect(outcome).toEqual({ status: "pending", hash: expect.stringMatching(/^0x/) });
    expect((await h.journal.getTransaction(k.idempotencyKey))?.status).toBe("broadcast");

    // Still down: resolve and recover leave it non-final and report nothing ambiguous.
    expect((await h.executor.resolve(k.idempotencyKey))?.status).toBe("pending");
    expect(await h.executor.recover()).toEqual({ resolved: 0, rebroadcast: 0, unknown: [] });
    expect((await h.journal.getTransaction(k.idempotencyKey))?.status).toBe("broadcast");
    expect(allErrors(h, [outcome])).not.toContain(anvil.url.replace("http://", ""));

    node.down = false;
    node.downAfterBroadcast = false;
    await anvil.rpc("evm_mine");
    expect((await h.executor.resolve(k.idempotencyKey))?.status).toBe("confirmed");
  });

  it("returns pending, not unknown, when anvil is unreachable for the whole wait of a signed record", async () => {
    const node = switchable();
    const journal = new FakeJournal();
    const crashed = harness({ journal, transport: flakyBroadcast(false), options: { waitMs: 100 } });
    const k = key();
    expect((await crashed.executor.submit(transfer(), k)).status).toBe("pending");
    node.down = true;
    const unreachable = harness({ journal, transport: node.transport, options: { waitMs: 200 } });
    expect((await unreachable.executor.submit(transfer(), k)).status).toBe("pending");
    expect((await unreachable.executor.resolve(k.idempotencyKey))?.status).toBe("pending");
    expect((await unreachable.executor.recover()).unknown).toEqual([]);
    expect((await journal.getTransaction(k.idempotencyKey))?.status).toBe("signed");
    node.down = false;
    expect((await unreachable.executor.recover()).resolved).toBe(1);
    expect((await journal.getTransaction(k.idempotencyKey))?.status).toBe("confirmed");
  });

  it("enforces waitMs during a slow RPC call: submit returns pending at the budget, not after the call", async () => {
    const node = slowable(2_000);
    const h = harness({ transport: node.transport, options: { waitMs: 300 } });
    const k = key();
    node.slowAfterBroadcast = true;
    const started = Date.now();
    const outcome = await h.executor.submit(transfer(), k);
    const elapsed = Date.now() - started;
    expect(node.slow).toBe(true);
    expect(outcome).toEqual({ status: "pending", hash: expect.stringMatching(/^0x/) });
    expect(elapsed).toBeLessThan(1_500);
    expect((await h.journal.getTransaction(k.idempotencyKey))?.status).toBe("broadcast");

    // resolve() is bounded the same way while the node stays slow, then settles once it answers again.
    const resolveStarted = Date.now();
    expect((await h.executor.resolve(k.idempotencyKey))?.status).toBe("pending");
    expect(Date.now() - resolveStarted).toBeLessThan(1_500);
    node.slow = false;
    node.slowAfterBroadcast = false;
    // viem shares an identical in-flight read with a new caller: let the stalled reads finish first.
    await systemClock.sleep(2_100);
    expect((await h.executor.resolve(k.idempotencyKey))?.status).toBe("confirmed");
  });

  it("returns from a slow RPC call as soon as the shutdown signal aborts", async () => {
    const node = slowable(4_000);
    const h = harness({ transport: node.transport, options: { waitMs: 50_000 } });
    node.slowAfterBroadcast = true;
    const started = Date.now();
    setTimeout(() => h.controller.abort(), 200);
    const outcome = await h.executor.submit(transfer(), key());
    expect(outcome.status).toBe("pending");
    expect(Date.now() - started).toBeLessThan(2_000);
    node.slow = false;
  });

  it("gives every rebroadcast of startup recovery one shared waitMs, not waitMs each", async () => {
    const journal = new FakeJournal();
    const crashed = harness({ journal, transport: flakyBroadcast(false), options: { waitMs: 100 } });
    const keys = [key(), key()];
    for (const k of keys) expect((await crashed.executor.submit(transfer(), k)).status).toBe("pending");
    await anvil.rpc("evm_setAutomine", [false]);
    const restarted = harness({ journal, options: { waitMs: 1_000 } });
    const started = Date.now();
    const report = await restarted.executor.recover();
    const elapsed = Date.now() - started;
    expect(report).toEqual({ resolved: 0, rebroadcast: 2, unknown: [] });
    // Two waits of waitMs each would take at least 2 s.
    expect(elapsed).toBeGreaterThanOrEqual(900);
    expect(elapsed).toBeLessThan(1_800);
    await anvil.rpc("evm_mine");
    for (const k of keys) expect((await restarted.executor.resolve(k.idempotencyKey))?.status).toBe("confirmed");
  });

  it("persists the signed record via a fenced write before broadcast; a fenced-out executor never signs", async () => {
    const path = join(tmp, `${randomUUID()}.sqlite`);
    const journal = SqliteJournal.open(path, owner(), { redactor: new Redactor([anvil.url]) });
    const inner = http(anvil.url, { retryCount: 0 })({ retryCount: 0 });
    const seenAtBroadcast: Array<string | undefined> = [];
    const watching = custom(
      {
        async request({ method, params }: { method: string; params?: unknown }) {
          if (method === "eth_sendRawTransaction") {
            const [raw] = params as [Hex];
            const record = (await journal.listTransactions()).find((r) => r.signedRaw === raw);
            seenAtBroadcast.push(record?.status);
          }
          return inner.request({ method, params } as never);
        },
      },
      { retryCount: 0 }
    );
    const h = harness({ transport: watching, journal: journal as unknown as FakeJournal });
    expect((await h.executor.submit(transfer(), key())).status).toBe("confirmed");
    expect(seenAtBroadcast).toEqual(["signed"]);

    // Another instance takes the owner row over: this executor can no longer reserve or sign a nonce.
    const successor = SqliteJournal.open(path, owner({ staleAfterMs: 0 }), { redactor: new Redactor([]) });
    const pendingBefore = await nonce("pending");
    const k = key();
    await expect(h.executor.submit(transfer(), k)).rejects.toThrow(/lost ownership/);
    expect(seenAtBroadcast).toHaveLength(1);
    expect(await nonce("pending")).toBe(pendingBefore);
    expect(await successor.getTransaction(k.idempotencyKey)).toBeUndefined();
    await journal.close();
    await successor.close();
  });
});

describe("PlatformExecutor on a chain removed from the topology", () => {
  const REMOVED = 999;

  async function seed(journal: FakeJournal, status: "signed" | "broadcast" | "prepared", n: number) {
    const raw =
      status === "prepared"
        ? null
        : await account.signTransaction({
            chainId: REMOVED,
            type: "eip1559",
            to: RECIPIENT,
            value: 1n,
            nonce: n,
            gas: 21_000n,
            maxFeePerGas: 1n,
            maxPriorityFeePerGas: 1n,
          });
    const operation = await journal.createOperation({
      kind: "refill",
      pairId: "arc-arbitrum",
      description: `on removed chain ${status}`,
      scopes: [{ kind: "arbitration", pairId: "arc-arbitrum" }],
      payload: null,
    });
    await journal.recordTransaction({
      idempotencyKey: `op:${operation.id}:step:send`,
      operationId: operation.id,
      chainId: REMOVED,
      from: SIGNER,
      to: RECIPIENT,
      value: 1n,
      data: null,
      nonce: raw ? n : null,
      hash: raw ? keccak256(raw) : null,
      signedRaw: raw,
      status,
      error: null,
      replacedByHash: null,
      blockNumber: null,
    });
    return { operationId: operation.id, key: `op:${operation.id}:step:send` };
  }

  it("persists a signed record unknown in recover(), so reconciliation sends its operation to attention", async () => {
    const h = harness();
    const signed = await seed(h.journal, "signed", 0);
    const broadcast = await seed(h.journal, "broadcast", 1);
    const prepared = await seed(h.journal, "prepared", 0);
    const report = await reconcile({
      journal: h.journal,
      executor: h.executor,
      notifier: h.notifier,
      logger: new FakeLogger(),
    });
    expect(report.recovery.unknown).toEqual([signed.key, broadcast.key]);
    expect(await h.journal.getTransaction(signed.key)).toMatchObject({
      status: "unknown",
      error: `chain ${REMOVED} is not configured`,
    });
    expect((await h.journal.getTransaction(broadcast.key))?.status).toBe("unknown");
    // Nothing was signed for the prepared one: it is failed and its operation stays open for its loop.
    expect((await h.journal.getTransaction(prepared.key))?.status).toBe("failed");
    expect(report.attention.sort()).toEqual([signed.operationId, broadcast.operationId].sort());
    expect((await h.journal.getOperation(signed.operationId))?.status).toBe("attention");
    expect((await h.journal.getOperation(prepared.operationId))?.status).toBe("open");
    expect(h.notifier.sent.filter((n) => n.severity === "critical")).toHaveLength(2);

    // resolve() and a repeat submit() under the key return unknown with the detail, and send nothing.
    const detail = `chain ${REMOVED} is not configured`;
    expect(await h.executor.resolve(signed.key)).toMatchObject({ status: "unknown", detail });
    expect(
      await h.executor.submit(
        { chainId: REMOVED, to: RECIPIENT, value: 1n },
        { idempotencyKey: signed.key, operationId: signed.operationId }
      )
    ).toMatchObject({ status: "unknown", detail });
    // A second recover() leaves it unknown (an unknown record is not re-inspected).
    expect((await h.executor.recover()).unknown).toEqual([signed.key, broadcast.key]);
  });

  it("never re-inspects or rebroadcasts an unknown record once its chain is configured again (L29)", async () => {
    const eoa = privateKeyToAccount(generatePrivateKey());
    await anvil.rpc("anvil_setBalance", [eoa.address, "0xde0b6b3a7640000"]);
    const journal = new FakeJournal();
    // Signed and broadcast on chain C (anvil), whose node never saw it: its nonce 0 is free.
    const raw = await eoa.signTransaction({
      chainId: CHAIN_ID,
      type: "eip1559",
      to: RECIPIENT,
      value: 1n,
      nonce: 0,
      gas: 21_000n,
      maxFeePerGas: 100_000_000_000n,
      maxPriorityFeePerGas: 1_000_000_000n,
    });
    const hash = keccak256(raw);
    const operation = await journal.createOperation({
      kind: "refill",
      pairId: "arc-arbitrum",
      description: "broadcast on C",
      scopes: [{ kind: "arbitration", pairId: "arc-arbitrum" }],
      payload: null,
    });
    const k = `op:${operation.id}:step:send`;
    await journal.recordTransaction({
      idempotencyKey: k,
      operationId: operation.id,
      chainId: CHAIN_ID,
      from: eoa.address,
      to: RECIPIENT,
      value: 1n,
      data: null,
      nonce: 0,
      hash,
      signedRaw: raw,
      status: "broadcast",
      error: null,
      replacedByHash: null,
      blockNumber: null,
    });
    // C removed from the topology: recover() persists unknown and reconciliation sends the operation to attention.
    const without = harness({ account: eoa, journal, chainId: REMOVED });
    const report = await reconcile({
      journal,
      executor: without.executor,
      notifier: without.notifier,
      logger: new FakeLogger(),
    });
    expect(report.recovery.unknown).toEqual([k]);
    expect((await journal.getTransaction(k))?.status).toBe("unknown");
    expect((await journal.getOperation(operation.id))?.status).toBe("attention");
    // The operator closes the operation and re-adds C.
    await journal.updateOperation(operation.id, { status: "failed", lastError: "closed by the operator" });
    const readded = harness({ account: eoa, journal });
    const again = await readded.executor.recover();
    expect(again).toEqual({ resolved: 0, rebroadcast: 0, unknown: [k] });
    expect(await readded.executor.resolve(k)).toMatchObject({ status: "unknown", hash });
    expect(await readded.executor.submit(transfer(1n), { idempotencyKey: k, operationId: operation.id })).toMatchObject(
      { status: "unknown", hash }
    );
    // Nothing was sent: the node still does not know the hash and the nonce is free.
    expect(await anvil.rpc("eth_getTransactionByHash", [hash])).toBeNull();
    expect(Number(await anvil.rpc<Hex>("eth_getTransactionCount", [eoa.address, "pending"]))).toBe(0);
    expect((await journal.getTransaction(k))?.status).toBe("unknown");
  });

  it("answers a confirmed record from the journal after its chain is removed; its operation stays open", async () => {
    const journal = new FakeJournal();
    const h = harness({ journal });
    const op = await journal.createOperation({
      kind: "refill",
      pairId: "arc-arbitrum",
      description: "confirmed on C",
      scopes: [{ kind: "arbitration", pairId: "arc-arbitrum" }],
      payload: null,
    });
    const k = { idempotencyKey: `op:${op.id}:step:send`, operationId: op.id };
    expect((await h.executor.submit(transfer(), k)).status).toBe("confirmed");
    const record = (await journal.getTransaction(k.idempotencyKey))!;
    const pendingBefore = await nonce("pending");
    // C removed from the topology: the confirmed record is final, so nothing is settled or sent to attention.
    const without = harness({ journal, chainId: REMOVED });
    const report = await reconcile({
      journal,
      executor: without.executor,
      notifier: without.notifier,
      logger: new FakeLogger(),
    });
    expect(report.recovery).toEqual({ resolved: 0, rebroadcast: 0, unknown: [] });
    expect(report.attention).toEqual([]);
    // resolve() and a repeat submit() answer it from the journal (no receipt to read: gasUsed 0).
    const confirmed: SubmitOutcome = {
      status: "confirmed",
      hash: record.hash as Hex,
      blockNumber: record.blockNumber!,
      gasUsed: 0n,
    };
    expect(await without.executor.resolve(k.idempotencyKey)).toEqual(confirmed);
    expect(await without.executor.submit(transfer(), k)).toEqual(confirmed);
    expect(await journal.getTransaction(k.idempotencyKey)).toEqual(record);
    expect((await journal.getOperation(op.id))?.status).toBe("open");
    expect(without.notifier.sent).toEqual([]);
    expect(await nonce("pending")).toBe(pendingBefore);
  });

  it("answers reverted, replaced and failed records from the journal; a non-final one stays unknown", async () => {
    const h = harness();
    const reason = `execution reverted revertData=${REVERT_SELECTOR}`;
    const error = `simulation reverted revertData=${REVERT_SELECTOR}`;
    const reverted = await seed(h.journal, "broadcast", 0);
    const revertedRecord = await h.journal.updateTransaction(reverted.key, {
      status: "reverted",
      blockNumber: 7n,
      error: reason,
    });
    const replaced = await seed(h.journal, "broadcast", 1);
    const replacedRecord = await h.journal.updateTransaction(replaced.key, {
      status: "replaced",
      error: "nonce 1 consumed by another transaction 1 blocks deep",
    });
    const failed = await seed(h.journal, "prepared", 0);
    await h.journal.updateTransaction(failed.key, { status: "failed", error });
    const cases: Array<{ seeded: { operationId: string; key: string }; expected: SubmitOutcome }> = [
      { seeded: reverted, expected: { status: "reverted", hash: revertedRecord.hash as Hex, reason } },
      { seeded: replaced, expected: { status: "replaced", hash: replacedRecord.hash as Hex, replacedByHash: null } },
      { seeded: failed, expected: { status: "failed", error } },
    ];
    for (const { seeded, expected } of cases) {
      const k = seeded.key;
      const before = await h.journal.getTransaction(k);
      expect(await h.executor.resolve(k)).toEqual(expected);
      expect(
        await h.executor.submit(
          { chainId: REMOVED, to: RECIPIENT, value: 1n },
          { idempotencyKey: k, operationId: seeded.operationId }
        )
      ).toEqual(expected);
      expect(await h.journal.getTransaction(k)).toEqual(before);
    }
    // Final records are not settled again.
    expect(await h.executor.recover()).toEqual({ resolved: 0, rebroadcast: 0, unknown: [] });
    // A non-final record still needs its chain (L22): resolve() answers unknown and persists nothing.
    const signed = await seed(h.journal, "signed", 3);
    expect(await h.executor.resolve(signed.key)).toMatchObject({
      status: "unknown",
      detail: `chain ${REMOVED} is not configured`,
    });
    expect((await h.journal.getTransaction(signed.key))?.status).toBe("signed");
    expect(h.notifier.sent).toEqual([]);
  });

  it("fails a new submit on an unconfigured chain with its own error; resolve() answers it (L65)", async () => {
    const h = harness();
    const k = key();
    const request: TxRequest = { chainId: REMOVED, to: RECIPIENT, value: 1n };
    const failed: SubmitOutcome = { status: "failed", error: `chain ${REMOVED} is not configured revertData=none` };
    expect(await h.executor.submit(request, k)).toEqual(failed);
    expect(await h.journal.getTransaction(k.idempotencyKey)).toMatchObject({
      status: "failed",
      nonce: null,
      signedRaw: null,
      error: failed.error,
    });
    expect(await h.executor.resolve(k.idempotencyKey)).toEqual(failed);
    expect(await h.executor.submit(request, k)).toEqual(failed);
    expect(h.notifier.sent).toEqual([]);
  });
});

describe("PlatformExecutor and closed operations", () => {
  it("never rebroadcasts a record whose operation is no longer open (L29)", async () => {
    const eoa = privateKeyToAccount(generatePrivateKey());
    await anvil.rpc("anvil_setBalance", [eoa.address, "0xde0b6b3a7640000"]);
    const h = harness({ account: eoa, options: { waitMs: 300 } });
    const records: string[] = [];
    for (const [i, status] of (["attention", "failed", "open"] as const).entries()) {
      const raw = await eoa.signTransaction({
        chainId: CHAIN_ID,
        type: "eip1559",
        to: RECIPIENT,
        value: 1n,
        nonce: i,
        gas: 21_000n,
        maxFeePerGas: 100_000_000_000n,
        maxPriorityFeePerGas: 1_000_000_000n,
      });
      const operation = await h.journal.createOperation({
        kind: "refill",
        pairId: "arc-arbitrum",
        description: `operation ${status}`,
        scopes: [{ kind: "arbitration", pairId: "arc-arbitrum" }],
        payload: null,
      });
      if (status !== "open") await h.journal.updateOperation(operation.id, { status, lastError: "closed" });
      const k = `op:${operation.id}:step:send`;
      records.push(k);
      await h.journal.recordTransaction({
        idempotencyKey: k,
        operationId: operation.id,
        chainId: CHAIN_ID,
        from: eoa.address,
        to: RECIPIENT,
        value: 1n,
        data: null,
        nonce: i,
        hash: keccak256(raw),
        signedRaw: raw,
        status: i === 0 ? "signed" : "broadcast",
        error: null,
        replacedByHash: null,
        blockNumber: null,
      });
    }
    // Only nonce 0 (attention) and 1 (failed) are closed: neither is sent, so the open one at nonce 2 is queued
    // behind them and nothing gets mined.
    const report = await h.executor.recover();
    expect(report.rebroadcast).toBe(1);
    for (const k of records.slice(0, 2)) {
      const record = await h.journal.getTransaction(k);
      expect(await anvil.rpc("eth_getTransactionByHash", [record?.hash])).toBeNull();
      expect(await h.executor.resolve(k)).toMatchObject({ status: "pending" });
      expect(await anvil.rpc("eth_getTransactionByHash", [record?.hash])).toBeNull();
    }
    expect(Number(await anvil.rpc<Hex>("eth_getTransactionCount", [eoa.address, "latest"]))).toBe(0);
  });
});

describe("PlatformExecutor gas limit and fees", () => {
  it("signs the simulated estimate plus the configured buffer; a request with gas set keeps it", async () => {
    const h = harness({ options: { gasLimitBufferPercent: 20 } });
    const buffered = await h.executor.submit(transfer(), key());
    expect(buffered.status).toBe("confirmed");
    const tx = (hash: Hex) => [...h.journal.transactions.values()].find((r) => r.hash === hash)!;
    expect(parseTransaction(tx((buffered as { hash: Hex }).hash).signedRaw!).gas).toBe(25_200n);
    const none = harness({ options: { gasLimitBufferPercent: 0 } });
    const exact = await none.executor.submit(transfer(), key());
    expect(parseTransaction([...none.journal.transactions.values()][0]!.signedRaw!).gas).toBe(21_000n);
    expect(exact.status).toBe("confirmed");
    const set = await h.executor.submit({ ...transfer(), gas: 30_000n }, key());
    expect(parseTransaction(tx((set as { hash: Hex }).hash).signedRaw!).gas).toBe(30_000n);
    expect(withBuffer(100_001n, 20)).toBe(120_002n);
  });

  it("sets maxFeePerGas with headroom: twice the latest base fee plus the priority fee", async () => {
    const rpc = new ViemExecutorRpc(http(anvil.url, { retryCount: 0 }), (t) => t, CHAIN_ID);
    const fees = await rpc.feeData(2);
    const block = await anvil.rpc<{ baseFeePerGas: Hex }>("eth_getBlockByNumber", ["latest", false]);
    const priority = BigInt(await anvil.rpc<Hex>("eth_maxPriorityFeePerGas"));
    expect(fees).toEqual({
      type: "eip1559",
      maxPriorityFeePerGas: priority,
      maxFeePerGas: 2n * BigInt(block.baseFeePerGas) + priority,
    });
    const h = harness();
    const outcome = await h.executor.submit(transfer(), key());
    const signed = parseTransaction([...h.journal.transactions.values()][0]!.signedRaw!);
    expect(outcome.status).toBe("confirmed");
    expect(signed.type).toBe("eip1559");
    expect(signed.maxPriorityFeePerGas).toBe(priority);
    expect(signed.maxFeePerGas! > priority).toBe(true);
  });

  it("signs a legacy transaction at the node's gas price on a chain without a base fee", async () => {
    const legacy = await startAnvil(CHAIN_ID, ["--hardfork", "berlin"]);
    try {
      const rpc = new ViemExecutorRpc(http(legacy.url, { retryCount: 0 }), (t) => t, CHAIN_ID);
      const fees = await rpc.feeData(2);
      const gasPrice = BigInt(await legacy.rpc<Hex>("eth_gasPrice"));
      expect(fees).toEqual({ type: "legacy", gasPrice });
      const h = harness({ url: legacy.url });
      const outcome = await h.executor.submit(transfer(), key());
      expect(outcome.status).toBe("confirmed");
      const signed = parseTransaction([...h.journal.transactions.values()][0]!.signedRaw!);
      expect(signed.type).toBe("legacy");
      expect(signed.gasPrice).toBe(gasPrice);
      expect(signed.gas).toBe(25_200n);
    } finally {
      await legacy.stop();
    }
  });
});

describe("PlatformExecutor operator gas reserve", () => {
  const ETH = 10n ** 18n;

  /** A fresh EOA (own nonces) funded with exactly `balance` wei. */
  async function funded(balance: bigint): Promise<PrivateKeyAccount> {
    const fresh = privateKeyToAccount(generatePrivateKey());
    await anvil.rpc("anvil_setBalance", [fresh.address, `0x${balance.toString(16)}`]);
    return fresh;
  }

  /** The gas cost cap of a plain transfer at the current fees (what the executor checks). */
  async function transferCost(): Promise<{ maxFeePerGas: bigint; cost: bigint }> {
    const fees = await new ViemExecutorRpc(http(anvil.url, { retryCount: 0 }), (t) => t, CHAIN_ID).feeData(2);
    if (fees.type !== "eip1559") throw new Error("anvil is eip1559");
    return { maxFeePerGas: fees.maxFeePerGas, cost: withBuffer(21_000n, 20) * fees.maxFeePerGas };
  }

  /** Debits the holding a value-bearing submit spends, as the loops do before calling the executor. */
  async function debited(journal: FakeJournal, value: bigint, operationId: string): Promise<void> {
    const entry = {
      scope: { kind: "arbitration" as const, pairId: "eth-home" },
      chainId: CHAIN_ID,
      asset: "native" as const,
      location: "eoa" as const,
      amount: value,
      operationId,
    };
    await journal.ledger.credit({ ...entry, reason: "withdrawn" });
    await journal.ledger.debit({ ...entry, reason: "deposit" });
  }

  function slack(journal: FakeJournal) {
    const sent: Notification[] = [];
    const provider: NotificationProvider = {
      name: "slack",
      enabled: true,
      minSeverity: "info",
      send: async (n) => void sent.push(n),
    };
    const notifier = new PlatformNotifier({
      journal,
      clock: systemClock,
      logger: new FakeLogger(),
      redact: (t) => t,
      providers: [provider],
      minSeverity: "info",
      dedupWindowSeconds: 3_600,
    });
    return { sent, notifier };
  }

  async function pendingNonce(address: Address): Promise<number> {
    return Number(await anvil.rpc<Hex>("eth_getTransactionCount", [address, "pending"]));
  }

  it("refuses a native-value submit with zero operator gas before signing; one critical per chain", async () => {
    const value = ETH;
    const eoa = await funded(value);
    const journal = new FakeJournal();
    const { sent, notifier } = slack(journal);
    const h = harness({ account: eoa, journal, notifyThrough: notifier });
    const k1 = key();
    await debited(journal, value, k1.operationId);
    const first = await h.executor.submit(transfer(value), k1);
    expect(first.status).toBe("failed");
    const error = (first as { error: string }).error;
    expect(error).toMatch(/^gas-reserve: /);
    expect(error).toMatch(/ revertData=none$/);
    expect(await journal.getTransaction(k1.idempotencyKey)).toMatchObject({ status: "failed", nonce: null, error });
    expect(await pendingNonce(eoa.address)).toBe(0);

    const k2 = key();
    await debited(journal, value, k2.operationId);
    expect((await h.executor.submit(transfer(value), k2)).status).toBe("failed");
    // Two refusals on one chain: one delivered critical, the repeat deduplicated by `gas-reserve:<chainId>`.
    expect(sent.map((n) => [n.severity, n.dedupKey])).toEqual([["critical", `gas-reserve:${CHAIN_ID}`]]);
    const log = journal.notificationLog.filter((e) => e.notification.dedupKey === `gas-reserve:${CHAIN_ID}`);
    expect(log.map((e) => [e.delivered, e.suppressed])).toEqual([
      [true, null],
      [false, "deduplicated"],
    ]);
    expect(await pendingNonce(eoa.address)).toBe(0);
  });

  it("subtracts an unmined record's value plus gas at its fee cap, and refuses a second submit then", async () => {
    await anvil.rpc("evm_setAutomine", [false]);
    const { maxFeePerGas, cost } = await transferCost();
    const value = ETH;
    const eoa = await funded(value + (cost * 3n) / 2n);
    const h = harness({ account: eoa, options: { waitMs: 100 } });
    const k1 = key();
    await debited(h.journal, value, k1.operationId);
    expect((await h.executor.submit(transfer(value), k1)).status).toBe("pending");

    const rpc = new ViemExecutorRpc(http(anvil.url, { retryCount: 0 }), (t) => t, CHAIN_ID);
    const reserve = await readGasReserve({ rpc, journal: h.journal, chainId: CHAIN_ID, signer: eoa.address });
    expect(reserve.transactionCount).toBe(0);
    expect(reserve.inFlight).toEqual([k1.idempotencyKey]);
    expect(reserve.inFlightWei).toBe(value + withBuffer(21_000n, 20) * maxFeePerGas);
    expect(reserve.reserveWei).toBe((cost * 3n) / 2n - cost);

    const k2 = key();
    const second = await h.executor.submit(transfer(0n), k2);
    expect(second.status).toBe("failed");
    expect((second as { error: string }).error).toMatch(/^gas-reserve: /);
    expect(await pendingNonce(eoa.address)).toBe(1);
  });

  it("accepts a submit while an earlier value-bearing record is mined but not confirmations deep", async () => {
    const { cost } = await transferCost();
    const value = ETH;
    // The operator reserve (3 x cost) is far smaller than the earlier record's value.
    const eoa = await funded(value + 3n * cost);
    const h = harness({ account: eoa, confirmations: 3, options: { waitMs: 300 } });
    const k1 = key();
    await debited(h.journal, value, k1.operationId);
    const first = await h.executor.submit(transfer(value), k1);
    expect(first.status).toBe("pending");
    const hash = (first as { hash: Hex }).hash;
    await mined(hash);
    expect((await h.journal.getTransaction(k1.idempotencyKey))?.status).toBe("broadcast");

    // Counting the mined record again (value + gas) would leave less than nothing and refuse this one.
    const second = await h.executor.submit(transfer(0n), key());
    expect(second.status).not.toBe("failed");
    expect(await pendingNonce(eoa.address)).toBe(2);
  });

  it("of two concurrent submits that together exceed the reserve, refuses exactly one", async () => {
    await anvil.rpc("evm_setAutomine", [false]);
    const { cost } = await transferCost();
    const eoa = await funded((cost * 3n) / 2n);
    const h = harness({ account: eoa, options: { waitMs: 100 } });
    const outcomes = await Promise.all([
      h.executor.submit(transfer(0n), key()),
      h.executor.submit(transfer(0n), key()),
    ]);
    expect(outcomes.map((o) => o.status).sort()).toEqual(["failed", "pending"]);
    expect(await pendingNonce(eoa.address)).toBe(1);
  });
});

const tmp = mkdtempSync(join(tmpdir(), "gb-executor-"));
afterAll(() => rmSync(tmp, { recursive: true, force: true }));

function owner(overrides: Partial<Ownership> = {}): Ownership {
  return { instanceId: randomUUID(), pid: process.pid, startedAt: new Date(), staleAfterMs: 60_000, ...overrides };
}

/**
 * A transport to anvil whose requests matching `stall` wait `delayMs` (a deterministic slow node, well beyond the
 * budgets under test) and whose requests matching `fail` throw a transport error; `before` runs ahead of each
 * forwarded request. A stalled request completes later in the background; nothing waits for it.
 */
interface Scripted {
  transport: Transport;
  stall: (method: string, params: unknown[]) => boolean;
  fail: (method: string, params: unknown[]) => boolean;
  before: (method: string) => void;
  sent: number;
}

function scripted(delayMs = 3_000): Scripted {
  const inner = http(anvil.url, { retryCount: 0 })({ retryCount: 0 });
  const never = () => false;
  const state: Scripted = {
    stall: never,
    fail: never,
    before: () => undefined,
    sent: 0,
    transport: custom(
      {
        async request({ method, params }: { method: string; params?: unknown }): Promise<unknown> {
          const args = (params ?? []) as unknown[];
          state.before(method);
          if (state.fail(method, args)) throw new Error(`connect ECONNREFUSED ${anvil.url}`);
          if (state.stall(method, args)) await systemClock.sleep(delayMs);
          if (method === "eth_sendRawTransaction") state.sent += 1;
          return inner.request({ method, params } as never);
        },
      },
      { retryCount: 0 }
    ),
  };
  return state;
}

/** `eth_call` at a block number (the executor's replay of an on-chain revert), not the `latest` simulation. */
const isReplay = (method: string, params: unknown[]) => method === "eth_call" && params[1] !== "latest";
const ABORTED_FORM = /^aborted: .* revertData=none$/;
const EMPTY_REVERTER: Address = "0x00000000000000000000000000000000000000ed";

describe("PlatformExecutor bounded submit (L53, L57)", () => {
  it("fails a submit whose pre-signing RPC outlasts waitMs with the aborted: form; nothing is signed", async () => {
    const node = scripted(3_000);
    node.stall = (method) => method === "eth_estimateGas";
    const h = harness({ transport: node.transport, options: { waitMs: 300 } });
    const k = key();
    const pendingBefore = await nonce("pending");
    const started = Date.now();
    const outcome = await h.executor.submit(transfer(), k);
    expect(Date.now() - started).toBeLessThan(1_500);
    expect(outcome.status).toBe("failed");
    const error = outcome.status === "failed" ? outcome.error : "";
    expect(error).toMatch(ABORTED_FORM);
    expect(error).toContain("wait budget");
    const record = await h.journal.getTransaction(k.idempotencyKey);
    expect(record).toMatchObject({ status: "failed", nonce: null, signedRaw: null, error });
    expect(node.sent).toBe(0);
    expect(await nonce("pending")).toBe(pendingBefore);
  });

  it("fails with the aborted: form when shutdown aborts a pre-signing RPC or precedes the submit", async () => {
    const node = scripted(3_000);
    node.stall = (method) => method === "eth_estimateGas";
    const h = harness({ transport: node.transport, options: { waitMs: 50_000 } });
    const pendingBefore = await nonce("pending");
    const started = Date.now();
    setTimeout(() => h.controller.abort(), 100);
    const midCall = await h.executor.submit(transfer(), key());
    expect(Date.now() - started).toBeLessThan(1_500);
    expect(midCall.status === "failed" && midCall.error).toMatch(ABORTED_FORM);
    expect(midCall.status === "failed" && midCall.error).toContain("shutdown");

    // The signal is already aborted: refused before any chain read.
    node.stall = () => false;
    const k = key();
    const before = await h.executor.submit(transfer(), k);
    expect(before.status === "failed" && before.error).toMatch(ABORTED_FORM);
    expect(before.status === "failed" && before.error).toContain("shutdown");
    expect((await h.journal.getTransaction(k.idempotencyKey))?.nonce).toBeNull();
    expect(node.sent).toBe(0);
    expect(await nonce("pending")).toBe(pendingBefore);
  });

  it("does not broadcast a record persisted signed once shutdown was requested; recover() sends it", async () => {
    const journal = new FakeJournal();
    const controllers: AbortController[] = [];
    const original = journal.updateTransaction.bind(journal);
    // Shutdown arrives right after the signed record is persisted, before its broadcast.
    journal.updateTransaction = async (idempotencyKey, update) => {
      const record = await original(idempotencyKey, update);
      if (update.status === "signed") controllers.forEach((c) => c.abort());
      return record;
    };
    const node = scripted();
    const h = harness({ journal, transport: node.transport });
    controllers.push(h.controller);
    const k = key();
    const pendingBefore = await nonce("pending");
    const outcome = await h.executor.submit(transfer(), k);
    expect(outcome.status).toBe("pending");
    expect((await journal.getTransaction(k.idempotencyKey))?.status).toBe("signed");
    expect(node.sent).toBe(0);
    expect(await nonce("pending")).toBe(pendingBefore);

    const restarted = harness({ journal });
    expect((await restarted.executor.recover()).rebroadcast).toBe(1);
    expect((await restarted.executor.resolve(k.idempotencyKey))?.status).toBe("confirmed");
  });

  it("checks ownership right before signing: a takeover during simulation signs and sends nothing", async () => {
    const path = join(tmp, `${randomUUID()}.sqlite`);
    const journal = SqliteJournal.open(path, owner(), { redactor: new Redactor([anvil.url]) });
    const node = scripted();
    let successor: SqliteJournal | undefined;
    node.before = (method) => {
      // Another instance takes the owner row over while this one estimates gas.
      if (method === "eth_estimateGas" && !successor) {
        successor = SqliteJournal.open(path, owner({ staleAfterMs: 0 }), { redactor: new Redactor([]) });
      }
    };
    let signatures = 0;
    const counting = {
      ...account,
      signTransaction: (...args: Parameters<PrivateKeyAccount["signTransaction"]>) => {
        signatures += 1;
        return account.signTransaction(...args);
      },
    } as PrivateKeyAccount;
    const h = harness({ transport: node.transport, journal: journal as unknown as FakeJournal, account: counting });
    const k = key();
    const pendingBefore = await nonce("pending");
    await expect(h.executor.submit(transfer(), k)).rejects.toThrow(/lost ownership/);
    expect(successor).toBeDefined();
    expect(signatures).toBe(0);
    expect(node.sent).toBe(0);
    expect(await nonce("pending")).toBe(pendingBefore);
    const record = await successor!.getTransaction(k.idempotencyKey);
    expect(record?.nonce ?? null).toBeNull();
    expect(record?.signedRaw ?? null).toBeNull();
    await journal.close();
    await successor!.close();
  });
});

describe("PlatformExecutor revert replay (L57, L62, L63)", () => {
  const reverting = (): TxRequest => ({ chainId: CHAIN_ID, to: REVERTER, value: 0n, data: "0x12", gas: 60_000n });

  beforeAll(async () => {
    await anvil.rpc("anvil_setCode", [EMPTY_REVERTER, "0x60006000fd"]);
  });

  async function replayAttempts(journal: FakeJournal, idempotencyKey: string): Promise<unknown> {
    return (await journal.observations(`replay:${idempotencyKey}`)).find((o) => o.key === `replay:${idempotencyKey}`)
      ?.value;
  }

  it("keeps a reverted record pending while its replay is slow, then records the replayed bytes", async () => {
    const node = scripted(3_000);
    node.stall = isReplay;
    const h = harness({ transport: node.transport, options: { waitMs: 300 } });
    const k = key();
    const started = Date.now();
    const outcome = await h.executor.submit(reverting(), k);
    expect(Date.now() - started).toBeLessThan(1_500);
    expect(outcome.status).toBe("pending");
    expect((await h.journal.getTransaction(k.idempotencyKey))?.status).toBe("broadcast");
    // resolve() is bounded the same way while the replay stays slow.
    expect((await h.executor.resolve(k.idempotencyKey))?.status).toBe("pending");
    expect(await replayAttempts(h.journal, k.idempotencyKey)).toMatchObject({ attempts: expect.any(Number) });

    node.stall = () => false;
    const settled = await h.executor.resolve(k.idempotencyKey);
    expect(settled?.status).toBe("reverted");
    expect(settled?.status === "reverted" && settled.reason).toMatch(new RegExp(`revertData=${REVERT_SELECTOR}$`));
    expect((await h.journal.getTransaction(k.idempotencyKey))?.error).toMatch(
      new RegExp(`revertData=${REVERT_SELECTOR}$`)
    );
  });

  it("makes an inconclusive replay final after the persisted attempt bound, across recreated executors", async () => {
    const journal = new FakeJournal();
    const node = scripted();
    node.fail = isReplay;
    const options = { waitMs: 200, replayMaxAttempts: 3, replayMaxAgeMs: 3_600_000 };
    const k = key();
    await anvil.rpc("evm_setAutomine", [false]);
    expect(
      (await harness({ journal, transport: node.transport, options }).executor.submit(reverting(), k)).status
    ).toBe("pending");
    await anvil.rpc("evm_mine");
    // Each executor is new (a restart between inspections): the bound lives in the journal, not in memory.
    for (const attempts of [1, 2]) {
      const fresh = harness({ journal, transport: node.transport, options });
      expect((await fresh.executor.resolve(k.idempotencyKey))?.status).toBe("pending");
      expect((await journal.getTransaction(k.idempotencyKey))?.status).toBe("broadcast");
      expect(await replayAttempts(journal, k.idempotencyKey)).toMatchObject({ attempts });
    }
    const last = harness({ journal, transport: node.transport, options });
    const outcome = await last.executor.resolve(k.idempotencyKey);
    expect(outcome?.status).toBe("reverted");
    expect(outcome?.status === "reverted" && outcome.reason).toMatch(
      /replay unavailable after 3 attempt\(s\).* revertData=none$/
    );
    const record = await journal.getTransaction(k.idempotencyKey);
    expect(record?.status).toBe("reverted");
    expect(record?.error).not.toContain(anvil.url);
  });

  it("makes an inconclusive replay final once the persisted age bound is reached", async () => {
    const journal = new FakeJournal();
    const node = scripted();
    node.fail = isReplay;
    const options = { waitMs: 200, replayMaxAttempts: 100, replayMaxAgeMs: 60_000 };
    const k = key();
    await anvil.rpc("evm_setAutomine", [false]);
    await harness({ journal, transport: node.transport, options }).executor.submit(reverting(), k);
    await anvil.rpc("evm_mine");
    expect(
      (await harness({ journal, transport: node.transport, options }).executor.resolve(k.idempotencyKey))?.status
    ).toBe("pending");
    const later = harness({ journal, transport: node.transport, options });
    later.clock.offsetMs = 61_000;
    const outcome = await later.executor.resolve(k.idempotencyKey);
    expect(outcome?.status === "reverted" && outcome.reason).toMatch(
      /replay unavailable after 2 attempt\(s\).* revertData=none$/
    );
  });

  it("makes a genuine empty-data revert final at once with revertData=none, without a replay bound", async () => {
    const h = harness();
    const k = key();
    const outcome = await h.executor.submit(
      { chainId: CHAIN_ID, to: EMPTY_REVERTER, value: 0n, data: "0x12", gas: 60_000n },
      k
    );
    expect(outcome.status).toBe("reverted");
    expect(outcome.status === "reverted" && outcome.reason).toMatch(/ revertData=none$/);
    expect(outcome.status === "reverted" && outcome.reason).not.toContain("replay unavailable");
    expect(await replayAttempts(h.journal, k.idempotencyKey)).toBeUndefined();
  });
});

/** A transport to anvil whose requests matching `fail` throw `error()` (an HTTP error or a refused connection). */
function failingWith(fail: (method: string) => boolean, error: () => Error): Transport {
  const inner = http(anvil.url, { retryCount: 0 })({ retryCount: 0 });
  return custom(
    {
      async request({ method, params }: { method: string; params?: unknown }): Promise<unknown> {
        if (fail(method)) throw error();
        return inner.request({ method, params } as never);
      },
    },
    { retryCount: 0 }
  );
}

async function fundedEoa(): Promise<PrivateKeyAccount> {
  const eoa = privateKeyToAccount(generatePrivateKey());
  await anvil.rpc("anvil_setBalance", [eoa.address, "0xde0b6b3a7640000"]);
  return eoa;
}

describe("PlatformExecutor transient failures before signing (L65)", () => {
  const http500 = (body: string) => () =>
    new HttpRequestError({ url: anvil.url, status: 500, body: { method: "eth_estimateGas" }, details: body });
  const refused = () => new Error(`connect ECONNREFUSED ${anvil.url}`);
  const cases: Array<[string, string, () => Error]> = [
    ["an HTTP 500 in the estimate", "eth_estimateGas", http500("Internal Server Error")],
    ["an HTTP 500 whose body says execution reverted", "eth_estimateGas", http500("execution reverted")],
    ["an HTTP 500 in the simulation", "eth_call", http500("Internal Server Error")],
    ["a refused connection in the simulation", "eth_call", refused],
    ["a refused connection in the fee data", "eth_getBlockByNumber", refused],
    ["a refused connection in the gas-reserve read", "eth_getBalance", refused],
  ];

  for (const [name, method, error] of cases) {
    it(`fails ${name} with the aborted: form; nothing is signed`, async () => {
      const h = harness({ transport: failingWith((m) => m === method, error) });
      const k = key();
      const pendingBefore = await nonce("pending");
      const outcome = await h.executor.submit(transfer(), k);
      expect(outcome.status).toBe("failed");
      const text = outcome.status === "failed" ? outcome.error : "";
      expect(text).toMatch(ABORTED_FORM);
      expect(text).not.toContain(anvil.url);
      expect(await h.journal.getTransaction(k.idempotencyKey)).toMatchObject({
        status: "failed",
        nonce: null,
        signedRaw: null,
        error: text,
      });
      expect(h.notifier.sent).toHaveLength(0);
      expect(await nonce("pending")).toBe(pendingBefore);
    });
  }

  it("keeps a contract revert in the simulation in the plain form, without the aborted: prefix", async () => {
    const h = harness();
    const outcome = await h.executor.submit({ chainId: CHAIN_ID, to: REVERTER, value: 0n, data: "0x12" }, key());
    expect(outcome.status === "failed" && outcome.error).toMatch(new RegExp(`revertData=${REVERT_SELECTOR}$`));
    expect(outcome.status === "failed" && outcome.error).not.toMatch(/^aborted:/);
  });
});

describe("PlatformExecutor first broadcast after signing (L65, L70)", () => {
  it("bounds a stalled first eth_sendRawTransaction by the remaining waitMs; record stays signed", async () => {
    const eoa = await fundedEoa();
    const node = scripted(3_000);
    node.stall = (method) => method === "eth_sendRawTransaction";
    const h = harness({ transport: node.transport, account: eoa, options: { waitMs: 400 } });
    const k = key();
    const started = Date.now();
    const outcome = await h.executor.submit(transfer(), k);
    expect(Date.now() - started).toBeLessThan(1_500);
    expect(outcome.status).toBe("pending");
    const record = await h.journal.getTransaction(k.idempotencyKey);
    expect(record).toMatchObject({ status: "signed", nonce: 0 });
    expect(record?.signedRaw).not.toBeNull();
    expect(record?.error).toMatch(/^broadcast: /);
    expect(record?.error).not.toContain(anvil.url);
  });

  it("keeps a record whose first broadcast throws without forwarding signed, pending; resolve() sends it", async () => {
    const eoa = await fundedEoa();
    const journal = new FakeJournal();
    const h = harness({ transport: flakyBroadcast(false), account: eoa, journal, options: { waitMs: 300 } });
    const k = key();
    const outcome = await h.executor.submit(transfer(), k);
    expect(outcome.status).toBe("pending");
    expect(await journal.getTransaction(k.idempotencyKey)).toMatchObject({ status: "signed", nonce: 0 });
    const healthy = harness({ account: eoa, journal });
    // The node does not know it and its nonce is free: resolve() sends the stored bytes, then confirms once mined.
    expect((await healthy.executor.resolve(k.idempotencyKey))?.status).toBe("pending");
    await mined((await journal.getTransaction(k.idempotencyKey))!.hash!);
    expect((await healthy.executor.resolve(k.idempotencyKey))?.status).toBe("confirmed");
  });
});

describe("PlatformExecutor ownership fence before a rebroadcast (L70)", () => {
  async function unknownToNode(journal: SqliteJournal, eoa: PrivateKeyAccount): Promise<{ key: string; hash: Hex }> {
    const raw = await eoa.signTransaction({
      chainId: CHAIN_ID,
      type: "eip1559",
      to: RECIPIENT,
      value: 1n,
      nonce: 0,
      gas: 21_000n,
      maxFeePerGas: 100_000_000_000n,
      maxPriorityFeePerGas: 1_000_000_000n,
    });
    const k = key();
    await journal.recordTransaction({
      idempotencyKey: k.idempotencyKey,
      operationId: k.operationId,
      chainId: CHAIN_ID,
      from: eoa.address,
      to: RECIPIENT,
      value: 1n,
      data: null,
      nonce: 0,
      hash: keccak256(raw),
      signedRaw: raw,
      status: "broadcast",
      error: null,
      replacedByHash: null,
      blockNumber: null,
    });
    return { key: k.idempotencyKey, hash: keccak256(raw) };
  }

  for (const via of ["resolve", "recover"] as const) {
    it(`${via}() throws lost ownership and sends nothing once another instance took the owner row`, async () => {
      const eoa = await fundedEoa();
      const path = join(tmp, `${randomUUID()}.sqlite`);
      const journal = SqliteJournal.open(path, owner(), { redactor: new Redactor([anvil.url]) });
      const node = scripted();
      const h = harness({ transport: node.transport, journal: journal as unknown as FakeJournal, account: eoa });
      const record = await unknownToNode(journal, eoa);
      const successor = SqliteJournal.open(path, owner({ staleAfterMs: 0 }), { redactor: new Redactor([]) });
      const run = via === "resolve" ? h.executor.resolve(record.key) : h.executor.recover();
      await expect(run).rejects.toThrow(/lost ownership/);
      expect(node.sent).toBe(0);
      expect(await anvil.rpc("eth_getTransactionByHash", [record.hash])).toBeNull();
      expect(Number(await anvil.rpc<Hex>("eth_getTransactionCount", [eoa.address, "pending"]))).toBe(0);
      expect((await successor.getTransaction(record.key))?.status).toBe("broadcast");
      await journal.close();
      await successor.close();
    });
  }
});

describe("PlatformExecutor replay bound per call (L66)", () => {
  const reverting = (): TxRequest => ({ chainId: CHAIN_ID, to: REVERTER, value: 0n, data: "0x12", gas: 60_000n });
  const attemptsOf = async (journal: FakeJournal, k: string) =>
    ((await journal.observations(`replay:${k}`)).find((o) => o.key === `replay:${k}`)?.value as { attempts: number })
      ?.attempts;

  it("counts an inconclusive replay once per call, however many polling rounds the call makes", async () => {
    const node = scripted();
    let replays = 0;
    node.fail = (method, params) => {
      const replay = isReplay(method, params);
      if (replay) replays += 1;
      return replay;
    };
    const options = { waitMs: 1_000, pollIntervalMs: 50, replayMaxAttempts: 3, replayMaxAgeMs: 3_600_000 };
    const h = harness({ transport: node.transport, options });
    const k = key();
    expect((await h.executor.submit(reverting(), k)).status).toBe("pending");
    expect(replays).toBeGreaterThan(3);
    expect(await attemptsOf(h.journal, k.idempotencyKey)).toBe(1);
    expect((await h.journal.getTransaction(k.idempotencyKey))?.status).toBe("broadcast");
    expect((await h.executor.submit(reverting(), k)).status).toBe("pending");
    expect(await attemptsOf(h.journal, k.idempotencyKey)).toBe(2);
    const outcome = await h.executor.resolve(k.idempotencyKey);
    expect(outcome?.status === "reverted" && outcome.reason).toMatch(
      /replay unavailable after 3 attempt\(s\).* revertData=none$/
    );
  });

  it("makes an old record (createdAt past the age bound) final only after replayMinAttempts calls", async () => {
    const journal = new FakeJournal();
    const node = scripted();
    node.fail = isReplay;
    const options = { waitMs: 200, replayMaxAttempts: 100, replayMaxAgeMs: 60_000 };
    const k = key();
    await anvil.rpc("evm_setAutomine", [false]);
    await harness({ journal, transport: node.transport, options }).executor.submit(reverting(), k);
    await anvil.rpc("evm_mine");
    // The record was created long before the receipt is seen: already past the age bound at its first replay.
    const late = harness({ journal, transport: node.transport, options });
    late.clock.offsetMs = 3_600_000;
    expect((await late.executor.resolve(k.idempotencyKey))?.status).toBe("pending");
    expect(await attemptsOf(journal, k.idempotencyKey)).toBe(1);
    const outcome = await late.executor.resolve(k.idempotencyKey);
    expect(outcome?.status === "reverted" && outcome.reason).toMatch(
      /replay unavailable after 2 attempt\(s\).* revertData=none$/
    );

    // replayMinAttempts is configurable.
    const k3 = key();
    await anvil.rpc("evm_setAutomine", [false]);
    await harness({ journal, transport: node.transport, options }).executor.submit(reverting(), k3);
    await anvil.rpc("evm_mine");
    const three = harness({ journal, transport: node.transport, options: { ...options, replayMinAttempts: 3 } });
    three.clock.offsetMs = 3_600_000;
    for (const attempts of [1, 2]) {
      expect((await three.executor.resolve(k3.idempotencyKey))?.status).toBe("pending");
      expect(await attemptsOf(journal, k3.idempotencyKey)).toBe(attempts);
    }
    expect((await three.executor.resolve(k3.idempotencyKey))?.status).toBe("reverted");
  });
});
