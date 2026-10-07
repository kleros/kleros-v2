import type { Notification, Severity } from "../../domain";
import type { Clock, Journal, Logger, Notifier } from "../../ports";
import type { Redact } from "../redact";

const RANK: Record<Severity, number> = { info: 0, warning: 1, critical: 2 };

export function atLeast(severity: Severity, floor: Severity): boolean {
  return RANK[severity] >= RANK[floor];
}

/** One delivery channel (Slack; Telegram later). Receives notifications that are already redacted. */
export interface NotificationProvider {
  readonly name: string;
  readonly enabled: boolean;
  readonly minSeverity: Severity;
  send(notification: Notification): Promise<void>;
}

export interface PlatformNotifierDeps {
  journal: Journal;
  clock: Clock;
  logger: Logger;
  redact: Redact;
  providers: NotificationProvider[];
  minSeverity: Severity;
  dedupWindowSeconds: number;
  /**
   * Undoes the hit `shouldNotify` recorded (the concrete journal's `forgetNotifyHit`), called when every provider
   * failed so the next occurrence of the key is delivered rather than suppressed for the whole window.
   */
  forgetHit?: (dedupKey: string, at: Date) => void | Promise<void>;
}

/**
 * The provider-independent wrapper: redacts title, body and action, applies the severity floor, deduplicates
 * through `Journal.shouldNotify` only when a provider is enabled for the severity, fans out to those providers and
 * journals every notification with `delivered` and `suppressed`, even when no provider is enabled. A delivery that
 * failed on every provider undoes its dedup hit, so the hit stays only after a provider was attempted.
 * When the journal refuses the dedup check (lost ownership, closed), the notification is still delivered, with an
 * in-memory window instead, so the lost-ownership critical reaches the operator. Never throws.
 */
export class PlatformNotifier implements Notifier {
  /** Fallback dedup for when the journal cannot be written: key to the time of the last delivery attempt. */
  private readonly memoryHits = new Map<string, number>();

  constructor(private readonly deps: PlatformNotifierDeps) {}

  /** `shouldNotify` through the journal; `"memory"` when the journal threw and the in-memory window let it pass. */
  private async gate(dedupKey: string, at: Date): Promise<boolean | "memory"> {
    try {
      return await this.deps.journal.shouldNotify(dedupKey, this.deps.dedupWindowSeconds, at);
    } catch (error) {
      this.deps.logger.warn("dedup check failed; delivering with an in-memory window", { error, dedupKey });
      const last = this.memoryHits.get(dedupKey);
      if (last !== undefined && at.getTime() - last < this.deps.dedupWindowSeconds * 1000) return false;
      this.memoryHits.set(dedupKey, at.getTime());
      return "memory";
    }
  }

  async notify(input: Notification): Promise<void> {
    const { journal, clock, logger, redact } = this.deps;
    const notification: Notification = {
      ...input,
      title: redact(input.title),
      body: redact(input.body),
      ...(input.action === undefined ? {} : { action: redact(input.action) }),
    };
    const at = clock.now();
    const log = async (delivered: boolean, providers: string[], suppressed: string | null) => {
      try {
        await journal.recordNotification({ notification, at, delivered, providers, suppressed });
      } catch (error) {
        logger.error("could not journal a notification", { error, dedupKey: notification.dedupKey });
      }
    };
    try {
      logger.info("notification", {
        severity: notification.severity,
        title: notification.title,
        dedupKey: notification.dedupKey,
        operationId: notification.operationId,
      });
      if (!atLeast(notification.severity, this.deps.minSeverity)) {
        return await log(false, [], `filtered: below ${this.deps.minSeverity}`);
      }
      // The dedup row is written only when a provider will attempt delivery ([L35]): a notification nobody could
      // receive must not suppress the next occurrence once a provider is enabled.
      const providers = this.deps.providers.filter((p) => p.enabled && atLeast(notification.severity, p.minSeverity));
      if (providers.length === 0) return await log(false, [], "no provider enabled for this severity");
      const gate = await this.gate(notification.dedupKey, at);
      if (!gate) return await log(false, [], "deduplicated");
      const delivered: string[] = [];
      const errors: string[] = [];
      for (const provider of providers) {
        try {
          await provider.send(notification);
          delivered.push(provider.name);
        } catch (error) {
          errors.push(`${provider.name}: ${redact(error instanceof Error ? error.message : String(error))}`);
        }
      }
      if (errors.length) logger.warn("notification provider failed", { errors });
      if (delivered.length === 0) {
        // Nothing reached the operator: the next occurrence of this key must not be deduplicated against it.
        if (gate === "memory") this.memoryHits.delete(notification.dedupKey);
        else {
          try {
            await this.deps.forgetHit?.(notification.dedupKey, at);
          } catch (error) {
            logger.warn("could not undo the dedup hit of an undelivered notification", {
              error,
              dedupKey: notification.dedupKey,
            });
          }
        }
      }
      await log(delivered.length > 0, delivered, errors.length ? `provider error: ${errors.join("; ")}` : null);
    } catch (error) {
      logger.error("notification failed", { error, dedupKey: notification.dedupKey });
      await log(false, [], `error: ${redact(error instanceof Error ? error.message : String(error))}`);
    }
  }
}

/** For `status`: logs only, journals nothing (the journal is read-only there). */
export class LogOnlyNotifier implements Notifier {
  constructor(private readonly logger: Logger) {}

  async notify(notification: Notification): Promise<void> {
    this.logger.info("notification (not delivered: read-only command)", {
      severity: notification.severity,
      title: notification.title,
      dedupKey: notification.dedupKey,
    });
  }
}
