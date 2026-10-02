/**
 * A loop is one independent business responsibility (a HomeGateway refill for one pair, the reporter
 * funding of one route, the rate maintenance of one pair). The platform schedules every loop on its own
 * interval and isolates failures: one loop's error never stops another. Shared signing is serialized by
 * the executor, not by the loops.
 */
export interface TickContext {
  now: Date;
  /** Aborted on shutdown; long waits must observe it. */
  signal: AbortSignal;
}

export type TickStatus =
  /** Nothing to do. */
  | "idle"
  /** Did work (sent or advanced an operation). */
  | "acted"
  /** Work was due but deferred by policy (uneconomical, no route, waiting on an in-flight operation). */
  | "deferred"
  /** The loop suspended itself (security-limit violation, ambiguous state); operator attention needed. */
  | "suspended"
  /** An unexpected error; the platform applies backoff. */
  | "failed";

export interface TickResult {
  status: TickStatus;
  summary: string;
}

export interface Loop {
  /** Unique, stable, e.g. "refill:arc-arbitrum", "reporter:base->arbitrum", "rate:arc-arbitrum". */
  readonly id: string;
  tick(ctx: TickContext): Promise<TickResult>;
}
