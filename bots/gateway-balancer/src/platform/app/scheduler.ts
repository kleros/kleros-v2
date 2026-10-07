import type { Loop, TickStatus } from "../../domain";
import type { Clock, Logger } from "../../ports";

export interface BackoffPolicy {
  initialMs: number;
  factor: number;
  maxMs: number;
}

export interface SchedulerOptions {
  clock: Clock;
  logger: Logger;
  /** The platform's shutdown signal; every tick receives it. */
  signal: AbortSignal;
  intervalFor(loopId: string): number;
  suspendedIntervalMs: number;
  backoff: BackoffPolicy;
}

export interface TickRecord {
  loopId: string;
  startedAt: Date;
  endedAt: Date;
  /** `threw` when the tick rejected instead of returning a result. */
  status: TickStatus | "threw";
  summary: string;
  nextDueAt: Date;
}

interface LoopState {
  loop: Loop;
  order: number;
  dueAt: number;
  failures: number;
}

/** The interval of a loop: its id in `intervalsMs`, else its kind (the id's prefix before `:`), else the default. */
export function intervalResolver(
  intervalsMs: Readonly<Record<string, number>>,
  defaultIntervalMs: number
): (loopId: string) => number {
  return (loopId) => intervalsMs[loopId] ?? intervalsMs[loopId.split(":")[0] ?? loopId] ?? defaultIntervalMs;
}

/**
 * Runs at most one tick at a time across the whole process. Each loop keeps its own interval, backoff and
 * suspended interval; the earliest due loop runs next (ties in registration order), so a long tick delays every
 * other loop instead of overlapping it. A loop is never stopped: a suspended loop is only ticked less often.
 *
 * `step()` and `runUntil()` drive it deterministically under a fake clock; `run()` is the production loop.
 */
export class Scheduler {
  private readonly states: LoopState[];
  private busy = false;
  readonly history: TickRecord[] = [];

  constructor(
    loops: Loop[],
    private readonly options: SchedulerOptions
  ) {
    const ids = new Set<string>();
    for (const loop of loops) {
      if (ids.has(loop.id)) throw new Error(`duplicate loop id ${loop.id}`);
      ids.add(loop.id);
    }
    const start = options.clock.now().getTime();
    this.states = loops.map((loop, order) => ({ loop, order, dueAt: start, failures: 0 }));
  }

  /** The loop that runs next and when. */
  peek(): { loopId: string; dueAt: Date } | undefined {
    const next = this.next();
    return next ? { loopId: next.loop.id, dueAt: new Date(next.dueAt) } : undefined;
  }

  /** Runs the earliest due loop if it is due now; never sleeps. */
  async step(): Promise<TickRecord | undefined> {
    const next = this.next();
    if (!next || next.dueAt > this.options.clock.now().getTime()) return undefined;
    return this.tick(next);
  }

  /** Steps through every tick due up to `time`, sleeping on the clock between them (a fake clock just advances). */
  async runUntil(time: Date): Promise<TickRecord[]> {
    const records: TickRecord[] = [];
    const { clock } = this.options;
    for (;;) {
      const next = this.next();
      if (!next || next.dueAt > time.getTime() || this.options.signal.aborted) break;
      const wait = next.dueAt - clock.now().getTime();
      if (wait > 0) await clock.sleep(wait);
      records.push(await this.tick(next));
    }
    const rest = time.getTime() - clock.now().getTime();
    if (rest > 0 && !this.options.signal.aborted) await clock.sleep(rest);
    return records;
  }

  /** Ticks until the signal aborts; resolves after the in-flight tick finishes. */
  async run(): Promise<void> {
    const { clock, signal } = this.options;
    while (!signal.aborted) {
      const next = this.next();
      if (!next) {
        await clock.sleep(60_000, signal).catch(() => undefined);
        continue;
      }
      const wait = next.dueAt - clock.now().getTime();
      if (wait > 0) {
        try {
          await clock.sleep(wait, signal);
        } catch {
          break;
        }
      }
      if (signal.aborted) break;
      await this.tick(next);
    }
  }

  private next(): LoopState | undefined {
    let best: LoopState | undefined;
    for (const state of this.states) {
      if (!best || state.dueAt < best.dueAt || (state.dueAt === best.dueAt && state.order < best.order)) best = state;
    }
    return best;
  }

  private async tick(state: LoopState): Promise<TickRecord> {
    if (this.busy) throw new Error("scheduler: a tick is already running");
    this.busy = true;
    const { clock, logger, signal, backoff } = this.options;
    const started = clock.now();
    let status: TickRecord["status"];
    let summary: string;
    try {
      const result = await state.loop.tick({ now: started, signal });
      status = result.status;
      summary = result.summary;
    } catch (error) {
      status = "threw";
      summary = error instanceof Error ? error.message : String(error);
    } finally {
      this.busy = false;
    }
    const ended = clock.now();
    const interval = this.options.intervalFor(state.loop.id);
    let dueAt: number;
    if (status === "failed" || status === "threw") {
      state.failures += 1;
      const delay = Math.min(backoff.initialMs * backoff.factor ** (state.failures - 1), backoff.maxMs);
      dueAt = ended.getTime() + Math.max(interval, delay);
      logger.warn("loop tick failed; backing off", { loopId: state.loop.id, failures: state.failures, summary });
    } else {
      state.failures = 0;
      const period = status === "suspended" ? Math.max(interval, this.options.suspendedIntervalMs) : interval;
      dueAt = Math.max(started.getTime() + period, ended.getTime());
      logger.debug("loop tick", { loopId: state.loop.id, status, summary });
    }
    state.dueAt = dueAt;
    const record: TickRecord = {
      loopId: state.loop.id,
      startedAt: started,
      endedAt: ended,
      status,
      summary,
      nextDueAt: new Date(dueAt),
    };
    this.history.push(record);
    if (this.history.length > 1000) this.history.splice(0, this.history.length - 1000);
    return record;
  }
}
