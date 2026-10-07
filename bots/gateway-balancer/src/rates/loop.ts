import type { PairConfig } from "../config/schema";
import { BPS, type JsonValue, type Loop, type Notification, type Operation, type TickResult } from "../domain";
import type { CorePorts, ForeignGatewayRate, PriceOracle, PriceResult, RateRejection, SubmitOutcome } from "../ports";
import type { RatesConfig } from "./config";

/** Persisted in the operation's step payload; `attempt` numbers the idempotency key of each submit. */
interface UpdateStep {
  attempt: number;
  /** The unadjusted market rate this attempt proposes. */
  rateE18: bigint;
  currentRateE18: bigint;
  hash: string | null;
  /** ISO time before which no new attempt is made (after a rejection). */
  deferUntil: string | null;
  rejections: number;
  lastRejection: RateRejection | null;
  criticalNotified: boolean;
}

/** The loop's price-availability memory, carried in its `rate:<pair>` observation across ticks and restarts. */
interface PriceMisses {
  priceMisses: number;
  priceUnavailableSince: string | null;
  priceWarned: boolean;
  priceCritical: boolean;
}

export interface RateLoopDeps {
  pair: PairConfig;
  rate: ForeignGatewayRate;
  priceOracle: PriceOracle;
  config: RatesConfig;
}

/** The symbol the pair's rate is quoted in: the rates override, else the pair's `rateCurrency`. */
export function quoteSymbolOf(pair: PairConfig, config: RatesConfig): string {
  return (config.pairs[pair.id]?.quoteSymbol ?? pair.rateCurrency ?? "USD").toUpperCase();
}

/** `|market - current| / current` in basis points, floored; any market rate differs fully from a zero rate. */
export function rateChangeBps(market: bigint, current: bigint): number {
  if (current <= 0n) return Number.POSITIVE_INFINITY;
  const diff = market > current ? market - current : current - market;
  return Number((diff * BPS) / current);
}

/** Executor prefix of a failure before signing caused by shutdown or an expired wait budget (decisions [L57]). */
export const ABORTED_PREFIX = "aborted:";

export function updateKey(operationId: string, attempt: number): string {
  return `op:${operationId}:step:update:${attempt}`;
}

/**
 * Rate maintenance of one pair: proposes the unadjusted market rate when it moved at least `updateTriggerBps`
 * from the contract's rate, and leaves every guardrail (cooldown, maximum change, bounds) to the contract.
 * Rejections defer the next attempt; nothing is retried before the configured wait and no price is clamped.
 */
export class RateLoop implements Loop {
  readonly id: string;
  private readonly quote: string;

  constructor(
    private readonly ports: Pick<CorePorts, "journal" | "executor" | "notifier" | "logger" | "clock">,
    private readonly deps: RateLoopDeps
  ) {
    this.id = `rate:${deps.pair.id}`;
    this.quote = quoteSymbolOf(deps.pair, deps.config);
  }

  private get pairId(): string {
    return this.deps.pair.id;
  }

  async tick(): Promise<TickResult> {
    const { journal } = this.ports;
    const blocked = await journal.listOperations({ kind: "rate-update", pairId: this.pairId, status: "attention" });
    let open: Operation | undefined = (
      await journal.listOperations({ kind: "rate-update", pairId: this.pairId, status: "open" })
    )[0];
    if (open?.step === "created") {
      // A crash between recording the intent and persisting the first attempt: nothing was submitted.
      await journal.updateOperation(open.id, { status: "failed", lastError: "abandoned before the first submit" });
      open = undefined;
    }
    if (open) {
      const step = open.stepPayload as unknown as UpdateStep;
      if (open.step === "submitting") return this.submit(open, step);
      if (open.step === "pending") return this.resume(open, step);
      if (step.deferUntil && this.now().getTime() < Date.parse(step.deferUntil)) {
        return {
          status: "deferred",
          summary: `${step.lastRejection ?? "rejected"}; next attempt after ${step.deferUntil}`,
        };
      }
    }
    if (!open && blocked.length > 0) return this.suspend(blocked);
    await this.clearSuspension();

    const market = await this.marketRate();
    if (market.kind === "unavailable") return { status: "deferred", summary: market.detail };

    let current: bigint;
    try {
      current = (await this.deps.rate.currentRate()).rateE18;
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      await this.recordRate({ status: "read-error", detail }, market.misses);
      return { status: "failed", summary: `reading the current rate failed: ${detail}` };
    }
    const changeBps = rateChangeBps(market.rateE18, current);
    const due = changeBps >= this.deps.config.updateTriggerBps;
    await this.recordRate(
      {
        status: due ? "update-due" : "within-trigger",
        marketRateE18: market.rateE18,
        currentRateE18: current,
        changeBps: Number.isFinite(changeBps) ? changeBps : null,
        quote: this.quote,
      },
      market.misses
    );

    if (!due) {
      if (open) {
        await journal.updateOperation(open.id, { status: "completed", step: "superseded" });
        return {
          status: "idle",
          summary: `market back within ${this.deps.config.updateTriggerBps} bps; ${open.id} closed`,
        };
      }
      return { status: "idle", summary: `rate within ${this.deps.config.updateTriggerBps} bps (${changeBps} bps)` };
    }

    if (open) {
      const prior = open.stepPayload as unknown as UpdateStep;
      const step: UpdateStep = {
        ...prior,
        attempt: prior.attempt + 1,
        rateE18: market.rateE18,
        currentRateE18: current,
        hash: null,
        deferUntil: null,
      };
      const updated = await journal.updateOperation(open.id, { step: "submitting", stepPayload: toJson(step) });
      return this.submit(updated, step);
    }

    const operation = await journal.createOperation({
      kind: "rate-update",
      description: `update ${this.pairId} rate to ${market.rateE18} (${this.quote}/ETH e18) from ${current}`,
      scopes: [{ kind: "gas", chainId: this.chainId() }],
      pairId: this.pairId,
      payload: { quote: this.quote, marketRateE18: market.rateE18, currentRateE18: current, changeBps },
    });
    const step: UpdateStep = {
      attempt: 1,
      rateE18: market.rateE18,
      currentRateE18: current,
      hash: null,
      deferUntil: null,
      rejections: 0,
      lastRejection: null,
      criticalNotified: false,
    };
    const updated = await journal.updateOperation(operation.id, { step: "submitting", stepPayload: toJson(step) });
    return this.submit(updated, step);
  }

  /** Submits the persisted attempt; a repeat under the same key (after a crash) never re-sends. */
  private async submit(operation: Operation, step: UpdateStep): Promise<TickResult> {
    const request = await this.deps.rate.updateRateTx(step.rateE18);
    const outcome = await this.ports.executor.submit(request, {
      idempotencyKey: updateKey(operation.id, step.attempt),
      operationId: operation.id,
    });
    return this.settle(operation, step, outcome);
  }

  private async resume(operation: Operation, step: UpdateStep): Promise<TickResult> {
    const outcome = await this.ports.executor.resolve(updateKey(operation.id, step.attempt));
    if (!outcome) return this.submit(operation, step);
    if (outcome.status === "pending") return { status: "deferred", summary: `${operation.id} awaiting confirmation` };
    return this.settle(operation, step, outcome);
  }

  private async settle(operation: Operation, step: UpdateStep, outcome: SubmitOutcome): Promise<TickResult> {
    const { journal } = this.ports;
    switch (outcome.status) {
      case "confirmed":
        await journal.updateOperation(operation.id, {
          status: "completed",
          step: "confirmed",
          stepPayload: toJson({ ...step, hash: outcome.hash }),
          lastError: null,
        });
        this.ports.logger.info("rate updated", { pairId: this.pairId, rateE18: step.rateE18.toString() });
        return { status: "acted", summary: `rate set to ${step.rateE18} in ${outcome.hash}` };
      case "pending":
        await journal.updateOperation(operation.id, {
          step: "pending",
          stepPayload: toJson({ ...step, hash: outcome.hash }),
        });
        return { status: "acted", summary: `rate update ${outcome.hash} pending` };
      case "failed":
        if (outcome.error.startsWith(ABORTED_PREFIX)) return this.aborted(operation, step, outcome.error);
        return this.rejected(operation, step, this.deps.rate.classifyRejection(outcome.error), outcome.error, null);
      case "reverted":
        return this.rejected(
          operation,
          step,
          this.deps.rate.classifyRejection(outcome.reason ?? ""),
          outcome.reason ?? "reverted",
          outcome.hash
        );
      case "replaced":
      case "unknown": {
        const detail =
          outcome.status === "replaced"
            ? `transaction ${outcome.hash} replaced by ${outcome.replacedByHash ?? "an unknown transaction"}`
            : outcome.detail;
        await journal.updateOperation(operation.id, { status: "attention", lastError: detail });
        await this.notify({
          severity: "warning",
          title: `Rate update of ${this.pairId} needs attention`,
          body: `${operation.id}: ${detail}. No new rate update is proposed for this pair until it is resolved.`,
          dedupKey: `rate:${this.pairId}:attention:${operation.id}`,
          operationId: operation.id,
          txHashes: outcome.hash ? [outcome.hash] : undefined,
          action:
            "Check the transaction on the explorer, read the contract's current rate, then mark the operation " +
            "completed or failed in the journal.",
        });
        return { status: "acted", summary: `${operation.id} needs attention: ${detail}` };
      }
    }
  }

  /**
   * Shutdown or an expired wait budget before signing ([L61]): not a contract rejection. Nothing was signed, so the
   * next tick retries under a new attempt key, with no rejection counted, no notification and no `deferUntil`.
   */
  private async aborted(operation: Operation, step: UpdateStep, detail: string): Promise<TickResult> {
    const next: UpdateStep = { ...step, hash: null, deferUntil: null };
    await this.ports.journal.updateOperation(operation.id, {
      step: "deferred",
      stepPayload: toJson(next),
      lastError: detail,
    });
    this.ports.logger.info("rate update aborted before signing; retrying next tick", { pairId: this.pairId });
    return { status: "deferred", summary: `${operation.id} aborted before signing; retrying next tick` };
  }

  private async rejected(
    operation: Operation,
    step: UpdateStep,
    rejection: RateRejection,
    detail: string,
    hash: `0x${string}` | null
  ): Promise<TickResult> {
    const { config } = this.deps;
    const waitSeconds = rejection === "cooldown" ? config.cooldownSeconds : config.rejectionRetrySeconds;
    const deferUntil = new Date(this.now().getTime() + waitSeconds * 1000).toISOString();
    const rejections = step.rejections + 1;
    const common = { operationId: operation.id, txHashes: hash ? [hash] : undefined };
    const rateText = `${step.rateE18} (${this.quote}/ETH e18, current ${step.currentRateE18})`;

    if (rejection === "max-change" || rejection === "out-of-bounds") {
      await this.notify({
        severity: "warning",
        title: `ForeignGateway rejected the ${this.pairId} rate: ${rejection}`,
        body:
          `The contract refused the market rate ${rateText}. The bot never adjusts the price to fit; it proposes ` +
          `the market rate again after ${deferUntil}.`,
        dedupKey: `rate:${this.pairId}:${rejection}`,
        action:
          rejection === "max-change"
            ? "None if the market moved fast (later updates catch up); otherwise check the price sources."
            : "Check the price sources; if the market really is outside the bounds, governance decides the bounds.",
        ...common,
      });
    } else if (rejection === "unauthorized") {
      await this.notify({
        severity: "critical",
        title: `The balancer is not authorized to update the ${this.pairId} rate`,
        body: `The ForeignGateway refused the update with its authorization error. Next attempt after ${deferUntil}.`,
        dedupKey: `rate:${this.pairId}:unauthorized`,
        action: "Grant the balancer EOA the rate-updater role on the ForeignGateway, or fix the configured address.",
        ...common,
      });
    } else if (rejection === "unknown") {
      await this.notify({
        severity: "warning",
        title: `Rate update of ${this.pairId} failed`,
        body: `${detail}. Next attempt after ${deferUntil}.`,
        dedupKey: `rate:${this.pairId}:unknown-rejection`,
        action: "Check the ForeignGateway address, the gas reserve and the RPC; the ABI fragment may be outdated.",
        ...common,
      });
    }

    let criticalNotified = step.criticalNotified;
    if (rejections >= config.rejectionsBeforeCritical && !criticalNotified) {
      criticalNotified = true;
      await this.notify({
        severity: "critical",
        title: `The ${this.pairId} rate cannot be updated`,
        body: `${rejections} consecutive rejections, the last one ${rejection}: ${detail}. Market rate ${rateText}.`,
        dedupKey: `rate:${this.pairId}:rejected`,
        action: "Investigate the rejections; the ForeignGateway keeps charging with the stale rate meanwhile.",
        ...common,
      });
    }

    const next: UpdateStep = { ...step, hash, deferUntil, rejections, lastRejection: rejection, criticalNotified };
    await this.ports.journal.updateOperation(operation.id, {
      step: "deferred",
      stepPayload: toJson(next),
      lastError: `${rejection}: ${detail}`,
      incrementAttempts: true,
    });
    this.ports.logger.warn("rate update rejected", { pairId: this.pairId, rejection, deferUntil });
    return { status: "deferred", summary: `rejected (${rejection}); next attempt after ${deferUntil}` };
  }

  /** The market rate in the quote symbol per ETH (e18), or why there is none. Handles the miss counters. */
  private async marketRate(): Promise<
    { kind: "rate"; rateE18: bigint; misses: PriceMisses } | { kind: "unavailable"; detail: string }
  > {
    const eth = await this.observePrice("ETH");
    const quote = this.quote === "USD" ? null : await this.observePrice(this.quote);
    const missing = [eth, quote].filter(
      (r): r is Extract<PriceResult, { kind: "unavailable" }> => r !== null && r.kind === "unavailable"
    );
    const prior = await this.priorMisses();
    if (missing.length > 0) {
      const detail = missing.map((r) => `${r.base} ${r.reason}: ${r.detail}`).join("; ");
      await this.priceMissed(prior, detail);
      return { kind: "unavailable", detail: `price unavailable: ${detail}` };
    }
    const ethPrice = (eth as Extract<PriceResult, { kind: "price" }>).priceE18;
    const rateE18 =
      quote === null ? ethPrice : (ethPrice * 10n ** 18n) / (quote as Extract<PriceResult, { kind: "price" }>).priceE18;
    return {
      kind: "rate",
      rateE18,
      misses: { priceMisses: 0, priceUnavailableSince: null, priceWarned: false, priceCritical: false },
    };
  }

  private async observePrice(base: string): Promise<PriceResult> {
    const result = await this.deps.priceOracle.price(base);
    const value: JsonValue =
      result.kind === "price"
        ? {
            kind: "price",
            priceE18: result.priceE18,
            spreadBps: result.spreadBps,
            sources: result.observations.map((o) => o.source),
            at: result.at.toISOString(),
          }
        : { kind: "unavailable", reason: result.reason, detail: result.detail };
    await this.ports.journal.recordObservation(`price:${base}`, value, this.now());
    return result;
  }

  private async priceMissed(prior: PriceMisses, detail: string): Promise<void> {
    const { config } = this.deps;
    const now = this.now();
    const misses: PriceMisses = {
      priceMisses: prior.priceMisses + 1,
      priceUnavailableSince: prior.priceUnavailableSince ?? now.toISOString(),
      priceWarned: prior.priceWarned,
      priceCritical: prior.priceCritical,
    };
    if (misses.priceMisses >= config.priceMissesBeforeWarning && !misses.priceWarned) {
      misses.priceWarned = true;
      await this.notify({
        severity: "warning",
        title: `No usable price for the ${this.pairId} rate`,
        body: `${misses.priceMisses} consecutive ticks without a price: ${detail}.`,
        dedupKey: `rate:${this.pairId}:price-unavailable`,
        action: "Check the price providers (feeds, API key, freshness limits) in the rates configuration.",
      });
    }
    const unavailableMs = now.getTime() - Date.parse(misses.priceUnavailableSince!);
    if (unavailableMs > config.priceUnavailableCriticalSeconds * 1000 && !misses.priceCritical) {
      misses.priceCritical = true;
      await this.notify({
        severity: "critical",
        title: `The ${this.pairId} rate has had no price since ${misses.priceUnavailableSince}`,
        body: `No rate update is possible while the price is unavailable: ${detail}.`,
        dedupKey: `rate:${this.pairId}:price-unavailable-critical`,
        action: "Restore the price providers or enable another source; the contract keeps the last accepted rate.",
      });
    }
    await this.recordRate({ status: "price-unavailable", detail, quote: this.quote }, misses);
  }

  private async priorMisses(): Promise<PriceMisses> {
    const key = `rate:${this.pairId}`;
    const found = (await this.ports.journal.observations(key)).find((o) => o.key === key);
    const value = (found?.value ?? {}) as Partial<PriceMisses>;
    return {
      priceMisses: typeof value.priceMisses === "number" ? value.priceMisses : 0,
      priceUnavailableSince: typeof value.priceUnavailableSince === "string" ? value.priceUnavailableSince : null,
      priceWarned: value.priceWarned === true,
      priceCritical: value.priceCritical === true,
    };
  }

  private async recordRate(fields: { [key: string]: JsonValue }, misses: PriceMisses | undefined): Promise<void> {
    const carried = misses ?? (await this.priorMisses());
    await this.ports.journal.recordObservation(
      `rate:${this.pairId}`,
      { ...fields, ...(carried as unknown as { [key: string]: JsonValue }) },
      this.now()
    );
  }

  private async suspend(blocked: Operation[]): Promise<TickResult> {
    const reason = `rate update ${blocked.map((op) => op.id).join(", ")} needs attention`;
    await this.ports.journal.recordObservation(`suspended:${this.id}`, { active: true, reason }, this.now());
    await this.notify({
      severity: "warning",
      title: `Rate maintenance of ${this.pairId} suspended`,
      body: `${reason}; no new rate update is proposed until the operator resolves it.`,
      dedupKey: `suspended:${this.id}`,
      action: "Resolve the operation (mark it completed or failed in the journal) after checking the contract's rate.",
    });
    return { status: "suspended", summary: reason };
  }

  private async clearSuspension(): Promise<void> {
    const key = `suspended:${this.id}`;
    const found = (await this.ports.journal.observations(key)).find((o) => o.key === key);
    const value = found?.value as { active?: unknown } | undefined;
    if (value?.active === true)
      await this.ports.journal.recordObservation(key, { active: false, reason: null }, this.now());
  }

  private async notify(notification: Omit<Notification, "pairId" | "chainId">): Promise<void> {
    await this.ports.notifier.notify({ ...notification, pairId: this.pairId, chainId: this.chainId() });
  }

  private chainId(): number {
    return this.deps.pair.foreignChainId;
  }

  private now(): Date {
    return this.ports.clock.now();
  }
}

function toJson(step: UpdateStep): JsonValue {
  return step as unknown as JsonValue;
}
