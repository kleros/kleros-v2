import { z } from "zod";

const severitySchema = z.enum(["info", "warning", "critical"]);
const positiveMs = z.number().int().positive();
const weiSchema = z
  .string()
  .regex(/^[0-9]+$/, "expected a decimal wei amount as a string")
  .transform((value) => BigInt(value));

export const slackProviderSchema = z
  .object({
    enabled: z.boolean().default(false),
    /** Name of the environment variable holding the webhook URL (the URL is a secret). */
    webhookUrlEnv: z.string().min(1).default("SLACK_WEBHOOK_URL"),
    /** Per-provider floor on top of the global one. */
    minSeverity: severitySchema.default("info"),
  })
  .default({});

export const telegramProviderSchema = z
  .object({
    /** The Telegram adapter is deferred; enabling it is refused at startup. */
    enabled: z.literal(false).default(false),
  })
  .default({});

function isLoopback(host: string): boolean {
  return host === "localhost" || host === "::1" || /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host);
}

/**
 * Owned by the platform lane: scheduling, confirmations, retry/backoff, gas reserves, notifications, journal
 * path, health. Every field has a default, so `"platform": {}` is a valid section.
 */
export const platformConfigSchema = z
  .object({
    /** SQLite journal file; relative paths resolve from the working directory. */
    journalPath: z.string().min(1).default("data/journal.sqlite"),
    schedule: z
      .object({
        /** Interval of a loop with no entry in `intervalsMs`. */
        defaultIntervalMs: positiveMs.default(60_000),
        /** Per loop id ("refill:arc-arbitrum") or loop kind ("refill", "reporter", "rate"); the id wins. */
        intervalsMs: z.record(z.string(), positiveMs).default({}),
        /** Interval of a loop whose last tick returned `suspended`. */
        suspendedIntervalMs: positiveMs.default(900_000),
        backoff: z
          .object({
            initialMs: positiveMs.default(30_000),
            factor: z.number().min(1).default(2),
            maxMs: positiveMs.default(1_800_000),
          })
          .default({}),
        /** How long shutdown waits for the in-flight tick; the container stop timeout must exceed it. */
        stopTimeoutMs: positiveMs.default(60_000),
      })
      .default({}),
    executor: z
      .object({
        /**
         * How long a submit waits for confirmations before returning `pending` (the loop resumes next tick).
         * The main latency knob: only one tick runs at a time, so a tick may hold the slot this long.
         */
        waitMs: positiveMs.default(45_000),
        pollIntervalMs: positiveMs.default(2_000),
        /** Age in `signed`/`broadcast` after which one warning per transaction is raised. */
        stuckAfterMs: positiveMs.default(900_000),
        /** `maxFeePerGas = baseFeeMultiplier * latest base fee + priority fee`. */
        baseFeeMultiplier: z.number().int().min(1).default(2),
        /** Gas limit = simulated estimate x (1 + percent / 100); a request that sets `gas` keeps it as is. */
        gasLimitBufferPercent: z.number().int().min(0).max(200).default(20),
        /**
         * An on-chain revert whose `eth_call` replay is inconclusive (timeout, transport, a node that cannot replay
         * the block) stays pending and is replayed on later inspections; after this many inconclusive replays
         * (counted once per call), or once the record is this old (from its `createdAt`) with at least
         * `replayMinAttempts` of them, it is made final `reverted` with `revertData=none` and a `replay unavailable`
         * note.
         */
        replayMaxAttempts: z.number().int().min(1).default(5),
        replayMaxAgeMs: positiveMs.default(600_000),
        replayMinAttempts: z.number().int().min(1).default(2),
      })
      .default({}),
    ownership: z
      .object({
        heartbeatMs: positiveMs.default(15_000),
        /** A row whose heartbeat is older than this is taken over. */
        staleAfterMs: positiveMs.default(180_000),
      })
      .default({}),
    gas: z
      .object({
        intervalMs: positiveMs.default(300_000),
        /** Minimum reserve (native balance minus ledger `eoa` native holdings) per chain id, in wei. */
        minimumReserveWei: z.record(z.string().regex(/^[0-9]+$/), weiSchema).default({}),
        defaultMinimumReserveWei: weiSchema.default("5000000000000000"),
      })
      .default({}),
    notifications: z
      .object({
        minSeverity: severitySchema.default("info"),
        dedupWindowSeconds: z.number().int().positive().default(3_600),
        providers: z
          .object({
            slack: slackProviderSchema,
            telegram: telegramProviderSchema,
          })
          .default({}),
      })
      .default({}),
    health: z
      .object({
        enabled: z.boolean().default(true),
        /** Loopback by default: `/healthz` is unauthenticated (it serves journal state only, never a secret). */
        host: z.string().min(1).default("127.0.0.1"),
        port: z.number().int().min(0).max(65_535).default(8_080),
        /** Explicit opt-in to bind `host` to a non-loopback address (for example behind a private network). */
        allowNonLoopback: z.boolean().default(false),
      })
      .default({}),
    http: z
      .object({
        /** Timeout of every `ports.fetch` request. */
        timeoutMs: positiveMs.default(30_000),
      })
      .default({}),
  })
  .superRefine((value, ctx) => {
    const { heartbeatMs, staleAfterMs } = value.ownership;
    const floor = Math.max(3 * heartbeatMs, value.executor.waitMs + value.schedule.stopTimeoutMs + 1);
    if (staleAfterMs < floor) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ownership", "staleAfterMs"],
        message: `must be at least ${floor} (3 x heartbeatMs and above executor.waitMs + schedule.stopTimeoutMs)`,
      });
    }
    if (!value.health.allowNonLoopback && !isLoopback(value.health.host)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["health", "host"],
        message: "is not a loopback address; the health endpoint is unauthenticated, set health.allowNonLoopback",
      });
    }
    if (value.schedule.stopTimeoutMs <= value.executor.waitMs) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["schedule", "stopTimeoutMs"],
        message: "must exceed executor.waitMs so an in-flight confirmation wait can finish",
      });
    }
  })
  .default({});
export type PlatformConfig = z.infer<typeof platformConfigSchema>;
