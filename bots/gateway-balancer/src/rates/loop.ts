import type { PairConfig } from "../config/schema";
import {
  BPS,
  type JsonValue,
  type Loop,
  type Notification,
  type Operation,
  type TickContext,
  type TickResult,
} from "../domain";
import type {
  CorePorts,
  ForeignGatewayRates,
  GatewayRateRejection,
  GatewayRateTarget,
  GatewayRateValue,
  KeeperGuardrails,
  PriceOracle,
  PriceResult,
  SubmitOutcome,
} from "../ports";
import type { RatesConfig } from "./config";
import { MAX_RATE_IN_ETH } from "./gatewayRates";

/** Persisted in the operation's step payload; `attempt` numbers the idempotency key of each submit. */
interface UpdateStep {
  attempt: number;
  /** The raw on-chain value this attempt proposes: one step toward the market, inside the contract's limits. */
  value: bigint;
  currentValue: bigint;
  hash: string | null;
  /** ISO time before which no new attempt is made (after a rejection the next cycle cannot fix). */
  deferUntil: string | null;
  rejections: number;
  lastRejection: GatewayRateRejection | null;
  criticalNotified: boolean;
  /** What this attempt was computed from: the guardrails and the last keeper update (the value is `currentValue`). */
  basis: string;
}

/** The price-availability memory, carried in the loop's `rate:<pair>:<target>` observation across ticks. */
interface PriceMisses {
  priceMisses: number;
  priceUnavailableSince: string | null;
  priceWarned: boolean;
  priceCritical: boolean;
}

export interface RateLoopDeps {
  pair: PairConfig;
  rates: ForeignGatewayRates;
  target: GatewayRateTarget;
  priceOracle: PriceOracle;
  config: RatesConfig;
}

/** `homeNative`, or the token's symbol: the `<target>` of the loop id `rate:<pair>:<target>`. */
export function rateTargetName(target: GatewayRateTarget): string {
  return target.kind === "homeNative" ? "homeNative" : target.asset.symbol;
}

/** The symbol the pair's native-currency rate is quoted in: the rates override, else the pair's `rateCurrency`. */
export function quoteSymbolOf(pair: PairConfig, config: RatesConfig): string {
  return (config.pairs[pair.id]?.quoteSymbol ?? pair.rateCurrency ?? "USD").toUpperCase();
}

/** `|market - current| / current` in basis points, floored; any market value differs fully from a zero value. */
export function rateChangeBps(market: bigint, current: bigint): number {
  if (current <= 0n) return Number.POSITIVE_INFINITY;
  const diff = market > current ? market - current : current - market;
  return Number((diff * BPS) / current);
}

/**
 * The value closest to `market` that the contract's check accepts from `current`:
 * `|next - current| * 10000 <= current * maxChangeBps`, exactly in integers.
 */
export function stepToward(current: bigint, market: bigint, maxChangeBps: bigint): bigint {
  const maxDelta = (current * maxChangeBps) / BPS;
  if (market > current) return market - current <= maxDelta ? market : current + maxDelta;
  return current - market <= maxDelta ? market : current - maxDelta;
}

/** `homeNativeRate` for a native currency priced at `quoteE18` USD (`null`: priced at 1 USD): ETH per unit, e18. */
export function homeNativeValue(ethUsdE18: bigint, quoteUsdE18: bigint | null): bigint {
  return quoteUsdE18 === null ? ethUsdE18 : (ethUsdE18 * 10n ** 18n) / quoteUsdE18;
}

/**
 * `rateInEth` of a token: `rateInEth / 10^rateDecimals` is its price in ETH times `10^(18 - tokenDecimals)`, wei per
 * smallest token unit (KlerosCore's encoding).
 */
export function tokenValue(
  tokenUsdE18: bigint,
  ethUsdE18: bigint,
  tokenDecimals: number,
  rateDecimals: number
): bigint {
  const exponent = 18 - tokenDecimals + rateDecimals;
  return exponent >= 0
    ? (tokenUsdE18 * 10n ** BigInt(exponent)) / ethUsdE18
    : tokenUsdE18 / (ethUsdE18 * 10n ** BigInt(-exponent));
}

/** Executor prefix of a failure before signing caused by shutdown or an expired wait budget (decisions [L57]). */
export const ABORTED_PREFIX = "aborted:";

export function updateKey(operationId: string, attempt: number): string {
  return `op:${operationId}:step:update:${attempt}`;
}

/**
 * Rate maintenance of one pair and one target (`homeNative`, or a token's `currencyRates`). Each cycle reads the
 * contract's guardrails and the value, and proposes one step toward the aggregated market value: the target clamped
 * so the contract's maximum change holds exactly, no earlier than `lastKeeperUpdate + cooldown`. Once the market is
 * `updateTriggerBps` away it keeps stepping until the distance is under `settleBps`. The bot never clamps a price into
 * a band of its own; every limit is the contract's, read each cycle.
 */
export class RateLoop implements Loop {
  readonly id: string;
  private readonly name: string;
  private readonly quote: string;

  constructor(
    private readonly ports: Pick<CorePorts, "journal" | "executor" | "notifier" | "logger" | "clock">,
    private readonly deps: RateLoopDeps
  ) {
    this.name = rateTargetName(deps.target);
    this.id = `rate:${deps.pair.id}:${this.name}`;
    this.quote = quoteSymbolOf(deps.pair, deps.config);
  }

  private get pairId(): string {
    return this.deps.pair.id;
  }

  /** This loop's operations of one status: the journal filter has no target, so the payload tells them apart. */
  private async operations(status: "open" | "attention"): Promise<Operation[]> {
    const all = await this.ports.journal.listOperations({ kind: "rate-update", pairId: this.pairId, status });
    return all.filter((op) => (op.payload as { target?: unknown } | null)?.target === this.name);
  }

  async tick(_?: TickContext): Promise<TickResult> {
    const { journal } = this.ports;
    const { config } = this.deps;
    const blocked = await this.operations("attention");
    let open: Operation | undefined = (await this.operations("open"))[0];
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

    let guardrails: KeeperGuardrails;
    let current: GatewayRateValue;
    try {
      guardrails = await this.deps.rates.guardrails();
      current = await this.deps.rates.current(this.deps.target);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      await this.recordRate({ status: "read-error", detail }, undefined);
      return { status: "failed", summary: `reading the current value failed: ${detail}` };
    }

    if (current.value === 0n) return this.zeroValue(open);
    await this.setFlag("zero", false);

    const market = await this.marketValue(current.decimals);
    if (market.kind === "unavailable") return { status: "deferred", summary: market.detail };
    if (market.value <= 0n || (this.deps.target.kind === "token" && market.value > MAX_RATE_IN_ETH)) {
      await this.recordRate({ status: "market-out-of-range", marketValue: market.value }, market.misses);
      await this.notify({
        severity: "warning",
        title: `The ${this.pairId} ${this.name} rate is out of range`,
        body:
          `The market value ${market.value} cannot be stored by the contract (positive; a token's rateInEth at ` +
          `most 2^64 - 1). Nothing is submitted.`,
        dedupKey: `${this.id}:market-out-of-range`,
        action: "Check the price sources and, for a token, the stored rateDecimals (the governor can lower them).",
      });
      return { status: "deferred", summary: `market value ${market.value} cannot be stored` };
    }

    const changeBps = rateChangeBps(market.value, current.value);
    const settling = await this.isSettling();
    const due = changeBps >= config.updateTriggerBps || (settling && changeBps >= config.settleBps);
    await this.recordRate(
      {
        status: due ? "update-due" : "within-trigger",
        marketValue: market.value,
        currentValue: current.value,
        changeBps,
        maxChangeBps: guardrails.maxChangeBps,
        cooldownSeconds: guardrails.cooldownSeconds,
      },
      market.misses
    );

    if (!due) {
      if (settling) await this.setSettling(false);
      if (open) {
        await journal.updateOperation(open.id, { status: "completed", step: "superseded" });
        return { status: "idle", summary: `market back within the trigger; ${open.id} closed` };
      }
      return { status: "idle", summary: `${this.name} within ${config.updateTriggerBps} bps (${changeBps} bps)` };
    }

    const next = stepToward(current.value, market.value, guardrails.maxChangeBps);
    if (next === current.value) {
      await this.notify({
        severity: "warning",
        title: `The ${this.pairId} ${this.name} rate cannot move`,
        body:
          `The contract's keeperMaxChangeBps ${guardrails.maxChangeBps} allows no change from ${current.value}; ` +
          `the market value is ${market.value}.`,
        dedupKey: `${this.id}:no-step`,
        action: "Governance sets the value or raises keeperMaxChangeBps.",
      });
      return { status: "deferred", summary: `the guardrails allow no step from ${current.value}` };
    }
    if (current.lastKeeperUpdate) {
      const earliest = current.lastKeeperUpdate.getTime() + Number(guardrails.cooldownSeconds) * 1000;
      if (this.now().getTime() < earliest) {
        const at = new Date(earliest).toISOString();
        return { status: "deferred", summary: `cooldown until ${at}; next step ${next} toward ${market.value}` };
      }
    }
    const basis = `${guardrails.maxChangeBps}:${guardrails.cooldownSeconds}:${current.lastKeeperUpdate?.getTime() ?? 0}`;
    if (open) {
      // A max-change rejection is fixed by new inputs, not by repeating the step: the same value from the same reads
      // is held back for rejectionRetrySeconds (a changed guardrail, value or last update proposes again). A cooldown
      // rejection with unchanged reads is a clock skew that only time cures, so it is held back once (deferUntil is
      // set by that hold) and then resubmitted, which counts the rejection towards the critical.
      const rejected = open.stepPayload as unknown as UpdateStep;
      if (
        (rejected.lastRejection === "max-change" || (rejected.lastRejection === "cooldown" && !rejected.deferUntil)) &&
        rejected.value === next &&
        rejected.currentValue === current.value &&
        rejected.basis === basis
      ) {
        const deferUntil = new Date(this.now().getTime() + config.rejectionRetrySeconds * 1000).toISOString();
        await journal.updateOperation(open.id, { stepPayload: toJson({ ...rejected, deferUntil }) });
        return {
          status: "deferred",
          summary: `${rejected.lastRejection} rejected ${next} and nothing changed; next attempt after ${deferUntil}`,
        };
      }
    }
    await this.setSettling(true);

    if (open) {
      const prior = open.stepPayload as unknown as UpdateStep;
      const step: UpdateStep = {
        ...prior,
        attempt: prior.attempt + 1,
        value: next,
        currentValue: current.value,
        hash: null,
        deferUntil: null,
        basis,
      };
      const updated = await journal.updateOperation(open.id, { step: "submitting", stepPayload: toJson(step) });
      return this.submit(updated, step);
    }

    const operation = await journal.createOperation({
      kind: "rate-update",
      description: `step ${this.pairId} ${this.name} rate to ${next} from ${current.value} (market ${market.value})`,
      scopes: [{ kind: "gas", chainId: this.chainId() }],
      pairId: this.pairId,
      payload: { target: this.name, marketValue: market.value, currentValue: current.value, changeBps },
    });
    const step: UpdateStep = {
      attempt: 1,
      value: next,
      currentValue: current.value,
      hash: null,
      deferUntil: null,
      rejections: 0,
      lastRejection: null,
      criticalNotified: false,
      basis,
    };
    const updated = await journal.updateOperation(operation.id, { step: "submitting", stepPayload: toJson(step) });
    return this.submit(updated, step);
  }

  /** Submits the persisted attempt; a repeat under the same key (after a crash) never re-sends. */
  private async submit(operation: Operation, step: UpdateStep): Promise<TickResult> {
    const request = await this.deps.rates.updateTx(this.deps.target, step.value);
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
        this.ports.logger.info("rate updated", {
          pairId: this.pairId,
          target: this.name,
          value: step.value.toString(),
        });
        return { status: "acted", summary: `${this.name} set to ${step.value} in ${outcome.hash}` };
      case "pending":
        await journal.updateOperation(operation.id, {
          step: "pending",
          stepPayload: toJson({ ...step, hash: outcome.hash }),
        });
        return { status: "acted", summary: `rate update ${outcome.hash} pending` };
      case "failed":
        if (outcome.error.startsWith(ABORTED_PREFIX)) return this.aborted(operation, step, outcome.error);
        return this.rejected(operation, step, this.deps.rates.classifyRejection(outcome.error), outcome.error, null);
      case "reverted":
        return this.rejected(
          operation,
          step,
          this.deps.rates.classifyRejection(outcome.reason ?? ""),
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
          title: `Rate update of ${this.pairId} ${this.name} needs attention`,
          body: `${operation.id}: ${detail}. No new rate update is proposed for this target until it is resolved.`,
          dedupKey: `${this.id}:attention:${operation.id}`,
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
    rejection: GatewayRateRejection,
    detail: string,
    hash: `0x${string}` | null
  ): Promise<TickResult> {
    const { config } = this.deps;
    // A cooldown or max-change rejection is fixed by the next cycle: it re-reads the guardrails, the value and the
    // last update and computes the step again, so there is nothing to wait for beyond the next tick.
    // (unless it computes the same value from the same inputs: `tick` then holds it back).
    const retryNow = rejection === "cooldown" || rejection === "max-change";
    const deferUntil = retryNow
      ? null
      : new Date(this.now().getTime() + config.rejectionRetrySeconds * 1000).toISOString();
    const after = deferUntil ? `Next attempt after ${deferUntil}.` : "The next cycle re-reads the guardrails.";
    const rejections = step.rejections + 1;
    const common = { operationId: operation.id, txHashes: hash ? [hash] : undefined };
    const valueText = `${step.value} (current ${step.currentValue})`;

    if (rejection === "max-change") {
      await this.notify({
        severity: "warning",
        title: `ForeignGateway rejected the ${this.pairId} ${this.name} step: max-change`,
        body: `The contract refused the step ${valueText}. The bot never adjusts a value to fit a band; ${after}`,
        dedupKey: `${this.id}:max-change`,
        action: "None if the governor changed keeperMaxChangeBps or the value; otherwise check the bot's arithmetic.",
        ...common,
      });
    } else if (rejection === "decimals") {
      await this.notify({
        severity: "warning",
        title: `ForeignGateway rejected the ${this.pairId} ${this.name} update: decimals`,
        body: `The stored rateDecimals changed between the read and the update. ${after}`,
        dedupKey: `${this.id}:decimals`,
        action: "Only the governor changes rateDecimals; the bot keeps the stored value on its next attempt.",
        ...common,
      });
    } else if (rejection === "invalid-rate") {
      await this.notify({
        severity: "warning",
        title: `ForeignGateway rejected the ${this.pairId} ${this.name} update: invalid rate`,
        body: `The contract refused the value ${valueText} as invalid. ${after}`,
        dedupKey: `${this.id}:invalid-rate`,
        action: "Check the price sources; homeNativeRate may not be zero.",
        ...common,
      });
    } else if (rejection === "unauthorized") {
      await this.notify({
        severity: "critical",
        title: `The balancer is not authorized to update the ${this.pairId} ${this.name} rate`,
        body: `The ForeignGateway refused the update with GovernorOrKeeperOnly. ${after}`,
        dedupKey: `${this.id}:unauthorized`,
        action: "Make the balancer EOA the ForeignGateway's keeper (the governor's changeKeeper), or fix the address.",
        ...common,
      });
    } else if (rejection === "unknown") {
      await this.notify({
        severity: "warning",
        title: `Rate update of ${this.pairId} ${this.name} failed`,
        body: `${detail}. ${after}`,
        dedupKey: `${this.id}:unknown-rejection`,
        action: "Check the ForeignGateway address, the gas reserve and the RPC.",
        ...common,
      });
    }

    let criticalNotified = step.criticalNotified;
    if (rejections >= config.rejectionsBeforeCritical && !criticalNotified) {
      criticalNotified = true;
      await this.notify({
        severity: "critical",
        title: `The ${this.pairId} ${this.name} rate cannot be updated`,
        body: `${rejections} consecutive rejections, the last one ${rejection}: ${detail}. Step ${valueText}.`,
        dedupKey: `${this.id}:rejected`,
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
    this.ports.logger.warn("rate update rejected", { pairId: this.pairId, target: this.name, rejection, deferUntil });
    return { status: "deferred", summary: `rejected (${rejection}); ${after}` };
  }

  /** A zero value cannot be moved by the keeper (the change check is relative): the governor must set it. */
  private async zeroValue(open: Operation | undefined): Promise<TickResult> {
    if (open) await this.ports.journal.updateOperation(open.id, { status: "failed", lastError: "the value is zero" });
    await this.setSettling(false);
    if (await this.flag("zero"))
      return { status: "deferred", summary: `${this.name} is zero; only the governor can set it` };
    await this.setFlag("zero", true);
    await this.notify({
      severity: "warning",
      title: `The ${this.pairId} ${this.name} rate is zero`,
      body: "The keeper cannot move a value from zero (the contract limits the relative change). Nothing is submitted.",
      dedupKey: `${this.id}:zero-value`,
      action: "The governor sets an initial value; the bot steps from there.",
    });
    return { status: "deferred", summary: `${this.name} is zero; only the governor can set it` };
  }

  /** The market value of the target in the contract's scale, or why there is none. Handles the miss counters. */
  private async marketValue(
    rateDecimals: number
  ): Promise<{ kind: "value"; value: bigint; misses: PriceMisses } | { kind: "unavailable"; detail: string }> {
    const { target } = this.deps;
    const eth = await this.observePrice("ETH");
    const other =
      target.kind === "token"
        ? await this.observePrice(target.asset.symbol.toUpperCase())
        : this.quote === "USD"
          ? null
          : await this.observePrice(this.quote);
    const missing = [eth, other].filter(
      (r): r is Extract<PriceResult, { kind: "unavailable" }> => r !== null && r.kind === "unavailable"
    );
    const prior = await this.priorMisses();
    if (missing.length > 0) {
      const detail = missing.map((r) => `${r.base} ${r.reason}: ${r.detail}`).join("; ");
      await this.priceMissed(prior, detail);
      return { kind: "unavailable", detail: `price unavailable: ${detail}` };
    }
    const ethUsd = (eth as Extract<PriceResult, { kind: "price" }>).priceE18;
    const otherUsd = other === null ? null : (other as Extract<PriceResult, { kind: "price" }>).priceE18;
    const value =
      target.kind === "token"
        ? tokenValue(otherUsd!, ethUsd, target.asset.decimals, rateDecimals)
        : homeNativeValue(ethUsd, otherUsd);
    return {
      kind: "value",
      value,
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
        title: `No usable price for the ${this.pairId} ${this.name} rate`,
        body: `${misses.priceMisses} consecutive ticks without a price: ${detail}.`,
        dedupKey: `${this.id}:price-unavailable`,
        action: "Check the price providers (feeds, API key, freshness limits) in the rates configuration.",
      });
    }
    const unavailableMs = now.getTime() - Date.parse(misses.priceUnavailableSince!);
    if (unavailableMs > config.priceUnavailableCriticalSeconds * 1000 && !misses.priceCritical) {
      misses.priceCritical = true;
      await this.notify({
        severity: "critical",
        title: `The ${this.pairId} ${this.name} rate has had no price since ${misses.priceUnavailableSince}`,
        body: `No rate update is possible while the price is unavailable: ${detail}.`,
        dedupKey: `${this.id}:price-unavailable-critical`,
        action: "Restore the price providers or enable another source; the contract keeps the last accepted rate.",
      });
    }
    await this.recordRate({ status: "price-unavailable", detail, quote: this.quote }, misses);
  }

  private async priorMisses(): Promise<PriceMisses> {
    const key = this.id;
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
      this.id,
      { ...fields, ...(carried as unknown as { [key: string]: JsonValue }) },
      this.now()
    );
  }

  private async suspend(blocked: Operation[]): Promise<TickResult> {
    const reason = `${this.id}: rate update ${blocked.map((op) => op.id).join(", ")} needs attention`;
    await this.ports.journal.recordObservation(`suspended:${this.id}`, { active: true, reason }, this.now());
    await this.notify({
      severity: "warning",
      title: `Rate maintenance of ${this.pairId} ${this.name} suspended`,
      body: `${reason}; no new rate update is proposed until the operator resolves it.`,
      dedupKey: `suspended:${this.id}`,
      action: "Resolve the operation (mark it completed or failed in the journal) after checking the contract's rate.",
    });
    return { status: "suspended", summary: reason };
  }

  private async flag(prefix: string): Promise<boolean> {
    const key = `${prefix}:${this.id}`;
    const found = (await this.ports.journal.observations(key)).find((o) => o.key === key);
    return (found?.value as { active?: unknown } | undefined)?.active === true;
  }

  private async setFlag(prefix: string, active: boolean): Promise<void> {
    if ((await this.flag(prefix)) === active) return;
    await this.ports.journal.recordObservation(`${prefix}:${this.id}`, { active }, this.now());
  }

  private isSettling(): Promise<boolean> {
    return this.flag("settling");
  }

  /** G5: after the trigger fired, stepping continues until the distance is under `settleBps`. */
  private setSettling(active: boolean): Promise<void> {
    return this.setFlag("settling", active);
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
