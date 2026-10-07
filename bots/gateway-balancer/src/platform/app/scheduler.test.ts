import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { privateKeyToAccount } from "viem/accounts";
import { afterAll, describe, expect, it } from "vitest";
import type { Loop, TickContext, TickResult } from "../../domain";
import type { Journal, SubmitOutcome } from "../../ports";
import { FakeClock } from "../../testing/fakeClock";
import { FakeJournal } from "../../testing/fakeJournal";
import { FakeLogger } from "../../testing/fakeLogger";
import { FakeNotifier } from "../../testing/fakeNotifier";
import { FakeExecutor } from "../../testing/fakeExecutor";
import { systemClock } from "../clock";
import { collectStatus } from "../health/health";
import { SqliteJournal } from "../journal/sqliteJournal";
import { reconcile } from "../reconcile/reconcile";
import { Redactor } from "../redact";
import { PlatformExecutor } from "../executor/executor";
import type { ExecutorRpc } from "../executor/rpc";
import { ANVIL_ACCOUNTS } from "../testkit/anvil";
import { intervalResolver, Scheduler, type SchedulerOptions } from "./scheduler";

const T0 = new Date("2026-01-01T00:00:00Z").getTime();

function at(ms: number): Date {
  return new Date(T0 + ms);
}

interface Span {
  id: string;
  start: number;
  end: number;
}

/** Records every tick's span on the fake clock and fails the test if two ticks ever overlap. */
class Probe {
  active = 0;
  maxActive = 0;
  readonly spans: Span[] = [];

  loop(
    id: string,
    clock: FakeClock,
    behave: (n: number) => { durationMs?: number; result?: TickResult } = () => ({})
  ): Loop {
    let n = 0;
    return {
      id,
      tick: async (ctx: TickContext) => {
        this.active += 1;
        this.maxActive = Math.max(this.maxActive, this.active);
        const start = ctx.now.getTime() - T0;
        const { durationMs = 0, result } = behave(n++);
        await Promise.resolve();
        clock.advance(durationMs);
        this.active -= 1;
        this.spans.push({ id, start, end: clock.now().getTime() - T0 });
        if (!result) throw new Error(`${id} exploded`);
        return result;
      },
    };
  }

  starts(id: string): number[] {
    return this.spans.filter((s) => s.id === id).map((s) => s.start);
  }
}

const idle: TickResult = { status: "idle", summary: "nothing" };

function scheduler(loops: Loop[], clock: FakeClock, overrides: Partial<SchedulerOptions> = {}): Scheduler {
  return new Scheduler(loops, {
    clock,
    logger: new FakeLogger(),
    signal: new AbortController().signal,
    intervalFor: intervalResolver({ "refill:a": 10_000, reporter: 25_000 }, 30_000),
    suspendedIntervalMs: 100_000,
    backoff: { initialMs: 20_000, factor: 2, maxMs: 80_000 },
    ...overrides,
  });
}

describe("Scheduler", () => {
  it("resolves intervals by loop id, then by kind, then the default", () => {
    const resolve = intervalResolver({ "refill:a": 1, reporter: 2 }, 3);
    expect([resolve("refill:a"), resolve("refill:b"), resolve("reporter:x->y"), resolve("rate:p")]).toEqual([
      1, 3, 2, 3,
    ]);
  });

  it("ticks each loop on its own interval through the step API", async () => {
    const clock = new FakeClock(at(0));
    const probe = new Probe();
    const s = scheduler(
      [
        probe.loop("refill:a", clock, () => ({ result: idle })),
        probe.loop("reporter:r", clock, () => ({ result: idle })),
      ],
      clock
    );
    expect(s.peek()).toEqual({ loopId: "refill:a", dueAt: at(0) });
    expect((await s.step())?.loopId).toBe("refill:a");
    expect((await s.step())?.loopId).toBe("reporter:r");
    expect(await s.step()).toBeUndefined();
    await s.runUntil(at(60_000));
    expect(probe.starts("refill:a")).toEqual([0, 10_000, 20_000, 30_000, 40_000, 50_000, 60_000]);
    expect(probe.starts("reporter:r")).toEqual([0, 25_000, 50_000]);
    expect(probe.maxActive).toBe(1);
  });

  it("never overlaps ticks: a long tick delays its own next tick and every other loop (gas monitor too)", async () => {
    const clock = new FakeClock(at(0));
    const probe = new Probe();
    const slow = probe.loop("refill:a", clock, (n) => ({ durationMs: n === 0 ? 25_000 : 0, result: idle }));
    const gas = probe.loop("gas-monitor", clock, () => ({ result: idle }));
    const other = probe.loop("reporter:r", clock, () => ({ result: idle }));
    const s = scheduler([slow, gas, other], clock, {
      intervalFor: intervalResolver({ "refill:a": 10_000, "gas-monitor": 5_000, reporter: 10_000 }, 30_000),
    });
    await s.runUntil(at(40_000));
    // The 25 s tick ran alone; everything due meanwhile ran after it, one at a time.
    expect(probe.spans[0]).toEqual({ id: "refill:a", start: 0, end: 25_000 });
    expect(probe.spans[1]).toMatchObject({ id: "gas-monitor", start: 25_000 });
    expect(probe.spans[2]).toMatchObject({ id: "reporter:r", start: 25_000 });
    expect(probe.starts("refill:a")).toEqual([0, 25_000, 35_000]);
    const sorted = [...probe.spans].sort((a, b) => a.start - b.start || a.end - b.end);
    for (let i = 1; i < sorted.length; i++) expect(sorted[i]!.start).toBeGreaterThanOrEqual(sorted[i - 1]!.end);
    expect(probe.maxActive).toBe(1);
  });

  it("backs off a throwing loop while the others keep their interval", async () => {
    const clock = new FakeClock(at(0));
    const probe = new Probe();
    const s = scheduler(
      [
        probe.loop("refill:a", clock, () => ({ result: idle })),
        probe.loop("rate:broken", clock, () => ({})),
        probe.loop("reporter:failed", clock, () => ({ result: { status: "failed", summary: "rpc down" } })),
      ],
      clock,
      { intervalFor: intervalResolver({ "refill:a": 10_000 }, 10_000) }
    );
    await s.runUntil(at(150_000));
    expect(probe.starts("rate:broken")).toEqual([0, 20_000, 60_000, 140_000]);
    expect(probe.starts("reporter:failed")).toEqual([0, 20_000, 60_000, 140_000]);
    expect(probe.starts("refill:a")).toHaveLength(16);
    expect(s.history.filter((r) => r.loopId === "rate:broken").every((r) => r.status === "threw")).toBe(true);
  });

  it("keeps invoking a suspended loop on the slower interval and restores its interval once it recovers", async () => {
    const clock = new FakeClock(at(0));
    const probe = new Probe();
    const suspended = probe.loop("refill:a", clock, (n) => ({
      result: n < 2 ? { status: "suspended", summary: "limit hit" } : idle,
    }));
    const s = scheduler([suspended, probe.loop("reporter:r", clock, () => ({ result: idle }))], clock);
    await s.runUntil(at(230_000));
    expect(probe.starts("refill:a")).toEqual([0, 100_000, 200_000, 210_000, 220_000, 230_000]);
    expect(probe.starts("reporter:r")).toEqual([
      0, 25_000, 50_000, 75_000, 100_000, 125_000, 150_000, 175_000, 200_000, 225_000,
    ]);
  });

  it("a loop clears its own suspension once the reason is gone; a restart clears nothing by itself", async () => {
    const path = join(tmp, `${randomUUID()}.sqlite`);
    const clock = new FakeClock(at(0));
    const open = () =>
      SqliteJournal.open(
        path,
        { instanceId: randomUUID(), pid: process.pid, startedAt: clock.now(), staleAfterMs: 60_000 },
        { redactor: new Redactor([]), now: () => clock.now() }
      );
    // The loop-owned rule (decisions.md): record `suspended:<id>` while the reason holds, clear it when it no longer
    // does. The scheduler only ticks a suspended loop less often; nothing else writes the observation.
    const world = { limitViolated: true };
    const ticks: number[] = [];
    const suspendingLoop = (journal: Journal): Loop => ({
      id: "refill:a",
      tick: async (ctx) => {
        ticks.push(ctx.now.getTime() - T0);
        const key = "suspended:refill:a";
        if (world.limitViolated) {
          await journal.recordObservation(key, { active: true, reason: "daily limit exceeded" }, ctx.now);
          return { status: "suspended", summary: "daily limit exceeded" };
        }
        const [current] = await journal.observations(key);
        if ((current?.value as { active?: boolean } | undefined)?.active) {
          await journal.recordObservation(key, { active: false, reason: null }, ctx.now);
        }
        return idle;
      },
    });
    const suspendedValue = async (journal: Journal) =>
      (await collectStatus(journal, clock.now())).observations.suspended.map((o) => o.value);

    let journal = open();
    await scheduler([suspendingLoop(journal)], clock).runUntil(at(100_000));
    expect(ticks).toEqual([0, 100_000]);
    expect(await suspendedValue(journal)).toEqual([{ active: true, reason: "daily limit exceeded" }]);

    // Restart: reconciliation and a new scheduler leave the suspension as the loop recorded it.
    await journal.close();
    journal = open();
    await reconcile({ journal, executor: new FakeExecutor(), notifier: new FakeNotifier(), logger: new FakeLogger() });
    expect(await suspendedValue(journal)).toEqual([{ active: true, reason: "daily limit exceeded" }]);
    const restarted = scheduler([suspendingLoop(journal)], clock);
    await restarted.step();
    expect(await suspendedValue(journal)).toEqual([{ active: true, reason: "daily limit exceeded" }]);

    // The reason no longer holds: the loop's next tick clears it and it is back on its normal interval.
    world.limitViolated = false;
    clock.advance(100_000);
    const record = await restarted.step();
    expect(record?.status).toBe("idle");
    expect(await suspendedValue(journal)).toEqual([{ active: false, reason: null }]);
    expect(record?.nextDueAt).toEqual(at(210_000));
    await journal.close();
  });

  it("on shutdown aborts the tick signal, the executor wait returns, and run() waits for the tick", async () => {
    const controller = new AbortController();
    const journal = new FakeJournal();
    // A chain where the transaction is known but never mined.
    const rpc: ExecutorRpc = {
      call: async () => undefined,
      estimateGas: async () => 21_000n,
      feeData: async () => ({ type: "eip1559", maxFeePerGas: 2n, maxPriorityFeePerGas: 1n }),
      getBlockNumber: async () => 10n,
      getBalance: async () => 10n ** 18n,
      getNonce: async () => 0,
      getReceipt: async () => null,
      getTransaction: async () => ({ blockNumber: null }),
      sendRawTransaction: async () => undefined,
    };
    const executor = new PlatformExecutor({
      account: privateKeyToAccount(ANVIL_ACCOUNTS[0]!.privateKey),
      chains: new Map([[1, { chainId: 1, name: "one", confirmations: 1, rpc }]]),
      journal,
      clock: systemClock,
      logger: new FakeLogger(),
      notifier: new FakeNotifier(),
      redact: (t) => t,
      signal: controller.signal,
      options: {
        waitMs: 50_000,
        pollIntervalMs: 20,
        stuckAfterMs: 3_600_000,
        baseFeeMultiplier: 2,
        gasLimitBufferPercent: 20,
        replayMaxAttempts: 5,
        replayMaxAgeMs: 600_000,
      },
    });
    const outcomes: SubmitOutcome[] = [];
    let tickSignal: AbortSignal | undefined;
    const loop: Loop = {
      id: "rate:p",
      tick: async (ctx) => {
        tickSignal = ctx.signal;
        outcomes.push(
          await executor.submit(
            { chainId: 1, to: "0x00000000000000000000000000000000000000cc", value: 1n },
            { idempotencyKey: "op:x:step:send", operationId: "x" }
          )
        );
        return { status: "acted", summary: "sent" };
      },
    };
    const s = new Scheduler([loop], {
      clock: systemClock,
      logger: new FakeLogger(),
      signal: controller.signal,
      intervalFor: () => 60_000,
      suspendedIntervalMs: 600_000,
      backoff: { initialMs: 1_000, factor: 2, maxMs: 10_000 },
    });
    const started = Date.now();
    const running = s.run();
    await systemClock.sleep(150);
    expect(outcomes).toEqual([]);
    controller.abort();
    await running;
    expect(Date.now() - started).toBeLessThan(3_000);
    expect(tickSignal?.aborted).toBe(true);
    expect(outcomes).toEqual([{ status: "pending", hash: expect.stringMatching(/^0x/) }]);
    expect(s.history.map((r) => r.status)).toEqual(["acted"]);
  });
});

const tmp = mkdtempSync(join(tmpdir(), "gb-scheduler-"));
afterAll(() => rmSync(tmp, { recursive: true, force: true }));
