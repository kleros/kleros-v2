import type { ReporterRoute } from "../config/schema";
import {
  NATIVE,
  scopeKey,
  type Hex,
  type JsonValue,
  type Loop,
  type Notification,
  type Operation,
  type TickContext,
  type TickResult,
} from "../domain";
import {
  InsufficientClaimable,
  InsufficientHolding,
  type CorePorts,
  type ForeignGatewayTreasury,
  type ReporterFunding,
  type RouteProvider,
  type SubmitOutcome,
  type TransferOutcome,
  type Transfers,
} from "../ports";
import { PreflightUnavailable } from "./adapter";
import {
  localHolding,
  needSizedInputs,
  planFunding,
  routeContext,
  suspendedObservationKey,
  type FundingPlan,
  type LegPlan,
  type RouteContext,
} from "./planner";

export interface ReporterLoopDeps {
  ports: CorePorts;
  funding: ReporterFunding;
  /** The ForeignGateway treasury of the route's pair; `undefined` suspends the route when it needs pool funds. */
  treasury: ForeignGatewayTreasury | undefined;
  transfers: Transfers;
  routeProvider: RouteProvider;
}

/** The immutable intent of a funding operation (`Operation.payload`). */
export interface FundingPayload {
  routeId: string;
  pairId: string;
  chainId: number;
  balance: bigint;
  lowWater: bigint;
  target: bigint;
  need: bigint;
  holdingUsed: bigint;
  expectedTotal: bigint;
  partial: boolean;
  shareE18: bigint;
  legs: LegPlan[];
}

type LegStatus = "planned" | "claimed" | "credited" | "settled" | "done";

export interface LegState {
  status: LegStatus;
  claimId: string | null;
  /** The confirmed withdrawal; the amount credited to `bridging:<route>` on the foreign chain. */
  withdrawn: bigint;
  /** The claim was released (not claimable, or the withdrawal failed); nothing was withdrawn. */
  released: boolean;
  /** Route-native output credited by `Transfers` to `bridging:<route>` on the reporter's chain. */
  received: bigint;
  transferFailed: boolean;
  /** Consecutive ambiguous `Transfers` deferrals of this leg (absent in operations journaled before run 005). */
  deferrals?: number;
  /** When the first of them happened (ISO time); the age limit runs from it. */
  deferredSince?: string | null;
}

/** `Operation.stepPayload`: rewritten whole at every step marker. */
export interface FundingState {
  legs: LegState[];
  /** The exact amount debited from the holding and sent to the reporter; set by the `debiting` marker. */
  fundAmount: bigint | null;
  fundHash: string | null;
  /**
   * Set by the `crediting` marker when the funding did not execute: the outcome, and the route-native holding
   * read just before the credit back, so a resume tells a credit that happened from one that did not.
   */
  refund?: RefundState | null;
}

export interface RefundState {
  /** `not-submitted`: the route was suspended at a resume before the funding submit (decisions [L30]). */
  outcome: "failed" | "reverted" | "not-submitted";
  detail: string;
  hash: Hex | null;
  holdingBefore: bigint;
}

type Progress = "progressed" | "waiting" | "closed";

/**
 * Why an open operation may not submit its funding this tick: the route is suspended (the operation closes before
 * its debit, or credits back a debit never submitted) or its preflight is unavailable (it waits).
 */
interface FundingGate {
  kind: "suspended" | "unavailable";
  reason: string;
}

const NOTIFY_PREFIX = "reporter";

/**
 * The closed set of `Transfers` deferral codes (decisions [L20]); a reason is `<code>: free text`. `no-route:`,
 * `policy-rejected:` and `price-unavailable:` are transient (nothing started, retried every tick, never `attention`
 * by count alone); `allocations-mismatch:` is a programming error (`attention` at once); `insufficient-holding:` and
 * any unrecognised reason are ambiguous (a credit this operation expects is missing) and bounded.
 */
const TRANSIENT_DEFERRALS = ["no-route:", "policy-rejected:", "price-unavailable:"] as const;
const FATAL_DEFERRALS = ["allocations-mismatch:"] as const;

export type DeferralKind = "transient" | "fatal" | "ambiguous";

export function classifyDeferral(reason: string): DeferralKind {
  if (TRANSIENT_DEFERRALS.some((code) => reason.startsWith(code))) return "transient";
  if (FATAL_DEFERRALS.some((code) => reason.startsWith(code))) return "fatal";
  return "ambiguous";
}

/** A submit `failed` before signing because of shutdown or an expired wait budget (decisions [L57], [L61]). */
export function isAborted(error: string): boolean {
  return error.startsWith("aborted:");
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function freshState(legs: LegPlan[]): FundingState {
  return {
    legs: legs.map(() => ({
      status: "planned",
      claimId: null,
      withdrawn: 0n,
      released: false,
      received: 0n,
      transferFailed: false,
      deferrals: 0,
      deferredSince: null,
    })),
    fundAmount: null,
    fundHash: null,
    refund: null,
  };
}

/**
 * Keeps one reporter between its low-water and target balance, from bridging fees only. Each operation runs
 * claim, withdraw (credit `bridging:<route>` on the foreign chain), an optional `Transfers` conversion or bridge to
 * the reporter's native token, then the bracketed debit and the native-transfer funding. Loops of one pair
 * coordinate only through ledger claims and holdings.
 */
export class ReporterFundingLoop implements Loop {
  readonly id: string;
  private readonly ctx: RouteContext;
  /** Step markers written by this instance; tells an operation that advanced from one that only waited. */
  private saves = 0;

  constructor(
    private readonly route: ReporterRoute,
    private readonly deps: ReporterLoopDeps
  ) {
    this.id = `reporter:${route.id}`;
    this.ctx = routeContext(deps.ports.config, route);
  }

  async tick(tick: TickContext): Promise<TickResult> {
    try {
      return await this.run(tick);
    } catch (error) {
      this.deps.ports.logger.error("reporter tick failed", { loop: this.id, error: describeError(error) });
      return { status: "failed", summary: describeError(error) };
    }
  }

  private async run(tick: TickContext): Promise<TickResult> {
    const { journal } = this.deps.ports;
    // Suspension and preflight first (decisions [L30]): an open operation never reaches its funding submit for a
    // reporter that turned ERC20-fee, lost its code or cannot be evaluated while its sources were in flight.
    let reason: string | null;
    let unavailable: string | null = null;
    try {
      reason = await this.suspensionReason();
    } catch (error) {
      if (!(error instanceof PreflightUnavailable)) throw error;
      // Neither a pass nor a refusal: the suspension state stays as it was and nothing new starts this tick.
      unavailable = error.message;
      reason = await this.recordedSuspension();
    }
    const gate: FundingGate | null = unavailable
      ? { kind: "unavailable", reason: unavailable }
      : reason
        ? { kind: "suspended", reason }
        : null;

    let progress: Progress | undefined;
    const before = await this.openOperation();
    if (before) progress = await this.advance(before, tick, gate);
    // The operation just advanced may have gone to attention, which suspends the route.
    if (!reason && !unavailable && before) reason = await this.attentionReason();

    let plan: FundingPlan | undefined;
    const open = await this.openOperation();
    if (unavailable) {
      await this.notifyUnavailable(unavailable);
      await this.recordCapacity(undefined, reason, open?.id ?? null, tick.now);
      const summary = open ? `operation ${open.id} at ${open.step}; ${unavailable}` : unavailable;
      if (before && !open && !reason)
        return { status: "acted", summary: `operation ${before.id} closed; ${unavailable}` };
      return { status: !open && reason ? "suspended" : "deferred", summary };
    }
    if (!reason && !before && !open) {
      plan = await planFunding(
        {
          config: this.deps.ports.config,
          journal,
          funding: this.deps.funding,
          treasury: this.deps.treasury,
          routeProvider: this.deps.routeProvider,
          signer: this.deps.ports.signer,
        },
        this.ctx
      );
      if (plan.kind === "suspend") reason = plan.reason;
    }
    await this.recordSuspension(reason, tick.now);
    await this.recordCapacity(plan, reason, open?.id ?? null, tick.now);

    if (before) {
      if (open) {
        return {
          status: progress === "progressed" && !reason ? "acted" : "deferred",
          summary: `operation ${open.id} at ${open.step}${reason ? ` (suspended: ${reason})` : ""}`,
        };
      }
      return reason
        ? { status: "suspended", summary: reason }
        : { status: "acted", summary: `operation ${before.id} closed` };
    }
    if (reason) return { status: "suspended", summary: reason };
    if (!plan || plan.kind === "suspend") return { status: "idle", summary: "nothing planned" };
    if (plan.kind === "idle") return { status: "idle", summary: `balance ${plan.balance} at or above low-water` };
    if (plan.kind === "deferred") {
      if (plan.short) await this.notifyShort(plan.reason, plan.balance, plan.thresholds.target);
      return { status: "deferred", summary: plan.reason };
    }
    return this.start(plan, tick);
  }

  private async start(plan: Extract<FundingPlan, { kind: "fund" }>, tick: TickContext): Promise<TickResult> {
    const payload: FundingPayload = {
      routeId: this.route.id,
      pairId: this.route.pairId,
      chainId: this.route.chainId,
      balance: plan.balance,
      lowWater: plan.thresholds.lowWater,
      target: plan.thresholds.target,
      need: plan.need,
      holdingUsed: plan.holdingUsed,
      expectedTotal: plan.expectedTotal,
      partial: plan.partial,
      shareE18: plan.shareE18,
      legs: plan.legs,
    };
    // The intent is journaled before the first claim or submit.
    const operation = await this.deps.ports.journal.createOperation({
      kind: "reporter-funding",
      description: `fund reporter ${this.route.id} up to ${plan.thresholds.target} (need ${plan.need})`,
      scopes: [this.ctx.scope],
      pairId: this.route.pairId,
      routeId: this.route.id,
      payload: payload as unknown as JsonValue,
    });
    if (plan.partial) {
      await this.notify({
        severity: "warning",
        title: `Reporter ${this.route.id} funded partially`,
        body:
          `Bridging funds of pair ${this.route.pairId} cover less than the shortfall of its reporters; ` +
          `funding ${plan.expectedTotal} of ${plan.need} (share ${plan.shareE18} / 1e18 of the pool).`,
        dedupKey: `${NOTIFY_PREFIX}:${this.route.id}:partial`,
        operationId: operation.id,
        action: "None required; the remaining shortfall is funded as bridging fees accrue.",
      });
    }
    await this.advance(operation, tick);
    const after = await this.deps.ports.journal.getOperation(operation.id);
    return {
      status: after?.status === "failed" ? "deferred" : "acted",
      summary: `operation ${operation.id} at ${after?.step ?? "?"} (${after?.status ?? "?"})`,
    };
  }

  // ---------------------------------------------------------------------------------------------- operation

  private async advance(operation: Operation, tick: TickContext, gate: FundingGate | null = null): Promise<Progress> {
    const payload = operation.payload as unknown as FundingPayload;
    const state =
      operation.stepPayload === null ? freshState(payload.legs) : (operation.stepPayload as unknown as FundingState);

    switch (operation.step) {
      case "debiting":
        await this.attention(
          operation,
          `resumed at the debiting marker: whether ${state.fundAmount} was debited from ${scopeKey(this.ctx.scope)} ` +
            `is unknown and the funding was never submitted`,
          "Reconcile the bridging holding of this route against the EOA balance, then close the operation."
        );
        return "closed";
      case "funding":
        if (gate && !(await this.deps.ports.executor.resolve(this.fundKey(operation)))) {
          return this.blockedAfterDebit(operation, state, gate);
        }
        return this.fund(operation, payload, state);
      case "crediting":
        return this.creditBack(operation, state);
      default:
        break;
    }

    const savedBefore = this.saves;
    for (let index = 0; index < payload.legs.length; index++) {
      const result = await this.advanceLeg(operation, payload, state, index, tick);
      if (result === "closed") return "closed";
      if (result === "waiting") return this.saves > savedBefore ? "progressed" : "waiting";
    }

    const sourced = state.legs.some((leg) => leg.withdrawn > 0n || leg.received > 0n) || payload.holdingUsed > 0n;
    if (!sourced) {
      await this.deps.ports.journal.updateOperation(operation.id, {
        step: "abandoned",
        stepPayload: state as unknown as JsonValue,
        status: "failed",
        lastError: "no bridging funds could be claimed; deferred",
      });
      return "closed";
    }

    const holding = await localHolding(this.deps.ports.journal, this.ctx);
    // What this operation put into the route-native holding; only this route's operations (one at a time) touch it.
    const sourcedLocal = payload.legs.reduce((acc, leg, index) => {
      const legState = state.legs[index]!;
      return acc + (leg.transfer ? legState.received : legState.withdrawn);
    }, 0n);
    if (holding < sourcedLocal) {
      await this.attention(
        operation,
        `the ${scopeKey(this.ctx.scope)} holding (${holding}) is short of the ${sourcedLocal} ` +
          `this operation sourced: ` +
          `a credit is missing`,
        "Reconcile the bridging holding of this route against the EOA balance, then close the operation."
      );
      return "closed";
    }
    const balance = await this.deps.funding.balance(this.route);
    const room = payload.target > balance ? payload.target - balance : 0n;
    const fundAmount = holding < room ? holding : room;
    if (fundAmount <= 0n) {
      await this.deps.ports.journal.updateOperation(operation.id, {
        step: "nothing-to-fund",
        stepPayload: state as unknown as JsonValue,
        status: "completed",
        lastError: null,
      });
      return "closed";
    }
    if (gate) return this.blockedBeforeDebit(operation, state, gate);
    // Bracketed debit: the marker carries the exact amount, then the debit, then the marker recording it.
    state.fundAmount = fundAmount;
    await this.save(operation, "debiting", state);
    try {
      await this.deps.ports.journal.ledger.debit({
        scope: this.ctx.scope,
        chainId: this.route.chainId,
        asset: NATIVE,
        location: "eoa",
        amount: fundAmount,
        operationId: operation.id,
        reason: "reporter funding",
      });
    } catch (error) {
      if (!(error instanceof InsufficientHolding)) throw error;
      // The debit did not happen: the operation fails cleanly, never falls back to another scope.
      await this.deps.ports.journal.updateOperation(operation.id, {
        step: "holding-short",
        status: "failed",
        lastError: error.message,
      });
      await this.notify({
        severity: "warning",
        title: `Reporter ${this.route.id}: bridging holding short`,
        body:
          `The ${scopeKey(this.ctx.scope)} holding holds ${error.available}, ` +
          `less than ${fundAmount}; funding deferred.`,
        dedupKey: `${NOTIFY_PREFIX}:${this.route.id}:holding-short`,
        operationId: operation.id,
        action: "Reconcile the bridging holding of this route against the EOA balance.",
      });
      return "closed";
    }
    await this.save(operation, "funding", state);
    return this.fund(operation, payload, state);
  }

  private async advanceLeg(
    operation: Operation,
    payload: FundingPayload,
    state: FundingState,
    index: number,
    tick: TickContext
  ): Promise<"next" | "waiting" | "closed"> {
    const plan = payload.legs[index]!;
    const leg = state.legs[index]!;
    const { journal } = this.deps.ports;

    if (leg.status === "planned") {
      if (plan.claimAmount > 0n) {
        const existing = (await journal.ledger.openClaims(plan.claimKey)).find((c) => c.operationId === operation.id);
        if (existing) {
          leg.claimId = existing.id;
          leg.status = "claimed";
        } else {
          const claimed = await this.claim(operation, plan);
          if (claimed) {
            leg.claimId = claimed;
            leg.status = "claimed";
          } else {
            leg.released = true;
            leg.status = "settled";
          }
        }
      } else {
        leg.status = "settled";
      }
      await this.save(operation, "sourcing", state);
    }

    if (leg.status === "claimed") {
      const request = await this.treasury().withdrawTx({
        category: "bridging",
        asset: plan.asset,
        amount: plan.claimAmount,
        recipient: this.deps.ports.signer,
      });
      const outcome = await this.deps.ports.executor.submit(request, {
        idempotencyKey: `op:${operation.id}:step:withdraw:${index}`,
        operationId: operation.id,
      });
      switch (outcome.status) {
        case "pending":
          return "waiting";
        case "confirmed":
          // The marker recording the credit is written before the credit (a crash leaves it untracked, never doubled).
          leg.withdrawn = plan.claimAmount;
          leg.status = "credited";
          await this.save(operation, "sourcing", state);
          await journal.ledger.credit({
            scope: this.ctx.scope,
            chainId: plan.asset.chainId,
            asset: plan.asset.address,
            location: "eoa",
            amount: plan.claimAmount,
            operationId: operation.id,
            reason: "bridging fees withdrawn",
          });
          break;
        case "failed":
        case "reverted":
          // Nothing left the ForeignGateway (a stale balance after another route's withdrawal): release and defer.
          if (leg.claimId && (await journal.ledger.openClaims(plan.claimKey)).some((c) => c.id === leg.claimId)) {
            await journal.ledger.releaseClaim(leg.claimId);
          }
          leg.released = true;
          leg.status = "settled";
          await this.save(operation, "sourcing", state);
          this.deps.ports.logger[outcome.status === "failed" && isAborted(outcome.error) ? "info" : "warn"](
            "bridging withdrawal not executed; claim released",
            {
              loop: this.id,
              operationId: operation.id,
              outcome: outcome.status,
              detail: outcome.status === "failed" ? outcome.error : outcome.reason,
            }
          );
          if (outcome.status === "reverted") {
            await this.notify({
              severity: "warning",
              title: `Reporter ${this.route.id}: bridging withdrawal reverted`,
              body:
                `The withdrawal of ${plan.claimAmount} ${plan.asset.symbol} reverted: ` +
                `${outcome.reason ?? "no reason"}.`,
              dedupKey: `${NOTIFY_PREFIX}:${this.route.id}:withdraw-reverted`,
              operationId: operation.id,
              txHashes: [outcome.hash],
              action: "Check the balancer's withdrawal permission on the ForeignGateway.",
            });
          }
          break;
        default:
          await this.attention(
            operation,
            `withdrawal ${index} ended ${this.describeOutcome(outcome)}; the claim stays open`,
            "Check whether the withdrawal executed on the foreign chain, then credit or release accordingly."
          );
          return "closed";
      }
    }

    if (leg.status === "credited") {
      if (leg.claimId && (await journal.ledger.openClaims(plan.claimKey)).some((c) => c.id === leg.claimId)) {
        await journal.ledger.settleClaim(leg.claimId, leg.withdrawn);
      }
      leg.status = "settled";
      await this.save(operation, "sourcing", state);
    }

    if (leg.status === "settled") {
      const available = leg.withdrawn + plan.holdingAmount;
      const sized = plan.transferAmount ?? needSizedInputs(payload.need, payload.holdingUsed, payload.legs)[index];
      const amount = sized !== undefined && sized < available ? sized : available;
      if (!plan.transfer || amount === 0n) {
        leg.status = "done";
        await this.save(operation, "sourcing", state);
        return "next";
      }
      if (tick.signal.aborted) return "waiting";
      let outcome: TransferOutcome;
      try {
        outcome = await this.deps.transfers.run({
          parentOperationId: operation.id,
          tag: `leg:${index}`,
          fromChainId: plan.asset.chainId,
          fromAsset: plan.asset,
          amount,
          toChainId: this.ctx.nativeAsset.chainId,
          toAsset: this.ctx.nativeAsset,
          allocations: [{ scope: this.ctx.scope, amount }],
          purpose: "reporter",
        });
      } catch (error) {
        if (!(error instanceof InsufficientHolding)) throw error;
        // The withdrawal's credit is missing (a crash between its marker and the credit): untracked, never doubled.
        await this.attention(
          operation,
          `transfer of ${amount} ${plan.asset.symbol} refused: ${error.message}`,
          "Reconcile the bridging holding of this route on the foreign chain against the EOA balance."
        );
        return "closed";
      }
      switch (outcome.status) {
        case "completed":
          leg.received = outcome.receivedByScope
            .filter((r) => scopeKey(r.scope) === scopeKey(this.ctx.scope))
            .reduce((acc, r) => acc + r.amount, 0n);
          leg.status = "done";
          await this.save(operation, "sourcing", state);
          return "next";
        case "in-progress":
          await this.resetDeferrals(operation, state, index);
          return "waiting";
        case "deferred":
          return this.deferred(operation, state, index, outcome.reason, tick.now);
        case "failed":
          // `Transfers` keeps the ledger: the funds stay a `bridging:<route>` holding on the source chain and the
          // next operation picks them up as a holding leg.
          leg.transferFailed = true;
          leg.status = "done";
          await this.save(operation, "sourcing", state);
          await this.notify({
            severity: "warning",
            title: `Reporter ${this.route.id}: transfer failed`,
            body: `Moving ${amount} ${plan.asset.symbol} to ${this.ctx.nativeAsset.symbol} failed: ${outcome.reason}.`,
            dedupKey: `${NOTIFY_PREFIX}:${this.route.id}:transfer-failed`,
            operationId: operation.id,
            action: "None required; the holding is retried by the next funding operation.",
          });
          return "next";
        case "attention":
          await this.attention(
            operation,
            `transfer ${outcome.operationId} needs attention: ${outcome.reason}`,
            "Resolve the transfer operation first, then close this funding operation."
          );
          return "closed";
      }
    }
    return "next";
  }

  /**
   * A leg's transfer did not start. Transient reasons warn once per operation and keep retrying; an ambiguous one
   * (the real `Transfers` defers `insufficient-holding:` when the withdrawal's credit is missing after a crash)
   * warns too, and once it repeated `maxAmbiguousDeferrals` times or is older than the age limit the operation goes
   * to `attention`, which also takes its withdrawn amount out of the pair's pool.
   */
  private async deferred(
    operation: Operation,
    state: FundingState,
    index: number,
    reason: string,
    now: Date
  ): Promise<"waiting" | "closed"> {
    const leg = state.legs[index]!;
    const kind = classifyDeferral(reason);
    this.deps.ports.logger.warn("reporter transfer deferred", {
      loop: this.id,
      operationId: operation.id,
      kind,
      reason,
    });
    if (kind === "fatal") {
      await this.attention(
        operation,
        `transfer of leg ${index} refused: ${reason}`,
        "A programming error built the transfer; report it, reconcile the bridging holding, then close the operation."
      );
      return "closed";
    }
    if (kind === "transient") {
      // Only consecutive ambiguous deferrals count toward `attention`.
      await this.resetDeferrals(operation, state, index);
      await this.notify({
        severity: "warning",
        title: `Reporter ${this.route.id}: transfer deferred`,
        body: `The transfer of leg ${index} did not start: ${reason}. It is retried every tick.`,
        dedupKey: `${NOTIFY_PREFIX}:${this.route.id}:transfer-deferred:${operation.id}`,
        operationId: operation.id,
        action: "None while it is transient; check the LI.FI routes and price sources if it persists.",
      });
      return "waiting";
    }
    const { maxAmbiguousDeferrals, ambiguousDeferralMaxAgeMinutes } = this.deps.ports.config.reporter;
    leg.deferrals = (leg.deferrals ?? 0) + 1;
    leg.deferredSince = leg.deferredSince ?? now.toISOString();
    const ageMs = now.getTime() - new Date(leg.deferredSince).getTime();
    if (leg.deferrals >= maxAmbiguousDeferrals || ageMs >= ambiguousDeferralMaxAgeMinutes * 60_000) {
      await this.deps.ports.journal.updateOperation(operation.id, { stepPayload: state as unknown as JsonValue });
      await this.attention(
        operation,
        `transfer of leg ${index} deferred ${leg.deferrals} times since ${leg.deferredSince}: ${reason}; ` +
          `the credit of its withdrawal of ${leg.withdrawn} is likely missing`,
        "Reconcile the bridging holding of this route on the foreign chain against the EOA balance " +
          "(credit the withdrawal if it is missing), then close the operation."
      );
      return "closed";
    }
    // Not a step marker: the counter alone is not progress.
    await this.deps.ports.journal.updateOperation(operation.id, { stepPayload: state as unknown as JsonValue });
    await this.notify({
      severity: "warning",
      title: `Reporter ${this.route.id}: transfer deferred, holding ambiguous`,
      body:
        `The transfer of leg ${index} did not start: ${reason}. ` +
        `The operation goes to attention after ${maxAmbiguousDeferrals} deferrals or ` +
        `${ambiguousDeferralMaxAgeMinutes} minutes.`,
      dedupKey: `${NOTIFY_PREFIX}:${this.route.id}:transfer-ambiguous:${operation.id}`,
      operationId: operation.id,
      action: "Reconcile the bridging holding of this route on the foreign chain against the EOA balance.",
    });
    return "waiting";
  }

  /**
   * Credits a funding that did not execute back to the holding, once. The holding is compared with the one recorded
   * at the `crediting` marker: unchanged means the credit is still due, raised by exactly the amount means it was
   * done before a crash; anything else is ambiguous and goes to `attention`.
   */
  private async creditBack(operation: Operation, state: FundingState): Promise<Progress> {
    const { journal } = this.deps.ports;
    const amount = state.fundAmount;
    const refund = state.refund;
    if (amount === null || amount <= 0n || !refund) {
      await this.attention(
        operation,
        "resumed at the crediting marker without a persisted amount or outcome",
        "Inspect the operation; reconcile the bridging holding of this route, then close it."
      );
      return "closed";
    }
    const holding = await localHolding(journal, this.ctx);
    if (holding === refund.holdingBefore) {
      await journal.ledger.credit({
        scope: this.ctx.scope,
        chainId: this.route.chainId,
        asset: NATIVE,
        location: "eoa",
        amount,
        operationId: operation.id,
        reason: "reporter funding not executed",
      });
    } else if (holding !== refund.holdingBefore + amount) {
      await this.attention(
        operation,
        `resumed at the crediting marker: the ${scopeKey(this.ctx.scope)} holding is ${holding}, neither ` +
          `${refund.holdingBefore} (credit due) nor ${refund.holdingBefore + amount} (credited); ` +
          `whether ${amount} was credited back is unknown`,
        "Reconcile the bridging holding of this route against the EOA balance, then close the operation."
      );
      return "closed";
    }
    const reverted = refund.outcome === "reverted";
    await journal.updateOperation(operation.id, {
      step: "refunded",
      stepPayload: state as unknown as JsonValue,
      status: reverted ? "attention" : "failed",
      lastError: `funding ${refund.detail}`,
    });
    if (refund.outcome === "failed" && isAborted(refund.detail.slice("failed: ".length))) {
      // Shutdown or an expired wait budget before signing (decisions [L61]): not a rejection. The next tick retries
      // from the holding under a new operation's key, with no notification, no suspension and no deferral.
      this.deps.ports.logger.info("reporter funding aborted before signing; retried next tick", {
        loop: this.id,
        operationId: operation.id,
        detail: refund.detail,
      });
      return "closed";
    }
    await this.notify({
      severity: reverted ? "critical" : "warning",
      title: `Reporter ${this.route.id}: funding ${refund.outcome}`,
      body:
        `The funding of ${amount} to ${this.route.reporter} ${refund.detail}. ` +
        `The amount is back in ${scopeKey(this.ctx.scope)}.`,
      dedupKey: `${NOTIFY_PREFIX}:${this.route.id}:funding-${refund.outcome}`,
      operationId: operation.id,
      ...(reverted && refund.hash ? { txHashes: [refund.hash] } : {}),
      action: reverted
        ? "Verify the reporter still accepts native transfers, then close the operation to resume the route."
        : refund.outcome === "not-submitted"
          ? "Fix the suspension cause; the next operation funds the reporter from the holding."
          : "None required; the next tick retries from the holding.",
    });
    return "closed";
  }

  /** Clears a leg's ambiguous-deferral counter (not a step marker); a no-op when it is already clear. */
  private async resetDeferrals(operation: Operation, state: FundingState, index: number): Promise<void> {
    const leg = state.legs[index]!;
    if ((leg.deferrals ?? 0) === 0 && !leg.deferredSince) return;
    leg.deferrals = 0;
    leg.deferredSince = null;
    await this.deps.ports.journal.updateOperation(operation.id, { stepPayload: state as unknown as JsonValue });
  }

  private async fund(operation: Operation, payload: FundingPayload, state: FundingState): Promise<Progress> {
    const { journal } = this.deps.ports;
    const amount = state.fundAmount;
    if (amount === null || amount <= 0n) {
      await this.attention(operation, "funding step without a persisted amount", "Inspect the operation.");
      return "closed";
    }
    const request = await this.deps.funding.fundingTx(this.route, amount);
    const outcome = await this.deps.ports.executor.submit(request, {
      idempotencyKey: this.fundKey(operation),
      operationId: operation.id,
    });
    switch (outcome.status) {
      case "pending":
        if (state.fundHash !== outcome.hash) {
          state.fundHash = outcome.hash;
          await this.save(operation, "funding", state);
        }
        return "waiting";
      case "confirmed": {
        state.fundHash = outcome.hash;
        await journal.updateOperation(operation.id, {
          step: "funded",
          stepPayload: state as unknown as JsonValue,
          status: "completed",
          lastError: null,
        });
        await journal.ledger.recordSpend({
          chainId: this.route.chainId,
          asset: NATIVE,
          category: "reporter",
          amount,
          operationId: operation.id,
          at: this.deps.ports.clock.now(),
        });
        await this.notify({
          severity: "info",
          title: `Reporter ${this.route.id} funded`,
          body: `Sent ${amount} ${this.ctx.nativeAsset.symbol} to ${this.route.reporter} (target ${payload.target}).`,
          dedupKey: `${NOTIFY_PREFIX}:${this.route.id}:funded:${operation.id}`,
          operationId: operation.id,
          txHashes: [outcome.hash],
        });
        return "closed";
      }
      case "failed":
      case "reverted": {
        // Nothing reached the reporter. Bracketed credit back: the `crediting` marker (with the holding before it),
        // the credit, then the terminal marker; a resume at `crediting` finishes the credit or goes to attention.
        const reverted = outcome.status === "reverted";
        if (!reverted) {
          // A `failed` funding is credited back only when it was never signed (the executor's record has no signed
          // transaction and no hash, and is itself `failed`); a signed transaction may still execute.
          const record = await journal.getTransaction(this.fundKey(operation));
          if (record && (record.status !== "failed" || record.signedRaw !== null || record.hash !== null)) {
            await this.attention(
              operation,
              `funding of ${amount} reported failed (${outcome.error}) but its transaction record is ` +
                `${record.status}${record.hash ? ` with hash ${record.hash}` : ""}; it may have been signed, ` +
                `so nothing is credited back`,
              "Check on the reporter's chain whether the funding executed; credit the holding back only if it did " +
                "not, then close the operation."
            );
            return "closed";
          }
        }
        state.refund = {
          outcome: outcome.status,
          detail: reverted ? `reverted: ${outcome.reason ?? "no reason"}` : `failed: ${outcome.error}`,
          hash: reverted ? outcome.hash : null,
          holdingBefore: await localHolding(journal, this.ctx),
        };
        await this.save(operation, "crediting", state);
        return this.creditBack(operation, state);
      }
      default:
        await this.attention(
          operation,
          `funding of ${amount} ended ${this.describeOutcome(outcome)}; never retried automatically`,
          "Check on the reporter's chain whether the funding executed; reconcile the holding, then close the operation."
        );
        return "closed";
    }
  }

  // ---------------------------------------------------------------------------------------------- helpers

  /** Claims the leg against the balance just read; `null` when it is no longer claimable (a deferral). */
  private async claim(operation: Operation, plan: LegPlan): Promise<string | null> {
    const balances = await this.treasury().balances();
    const onchain = balances.find((b) => b.asset.address.toLowerCase() === plan.asset.address.toLowerCase());
    try {
      const claim = await this.deps.ports.journal.ledger.claim({
        key: plan.claimKey,
        amount: plan.claimAmount,
        operationId: operation.id,
        onchainAvailable: onchain?.bridging ?? 0n,
      });
      return claim.id;
    } catch (error) {
      if (error instanceof InsufficientClaimable) {
        this.deps.ports.logger.info("bridging funds no longer claimable; deferred", {
          loop: this.id,
          operationId: operation.id,
          key: error.key,
          requested: error.requested.toString(),
          available: error.available.toString(),
        });
        return null;
      }
      throw error;
    }
  }

  private treasury(): ForeignGatewayTreasury {
    if (!this.deps.treasury) throw new Error(`no ForeignGateway adapter for pair ${this.route.pairId}`);
    return this.deps.treasury;
  }

  private async openOperation(): Promise<Operation | undefined> {
    const open = await this.deps.ports.journal.listOperations({
      kind: "reporter-funding",
      routeId: this.route.id,
      status: "open",
    });
    return open.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
  }

  private async save(operation: Operation, step: string, state: FundingState): Promise<void> {
    this.saves += 1;
    await this.deps.ports.journal.updateOperation(operation.id, { step, stepPayload: state as unknown as JsonValue });
    operation.step = step;
  }

  private async attention(operation: Operation, reason: string, action: string): Promise<void> {
    await this.deps.ports.journal.updateOperation(operation.id, { status: "attention", lastError: reason });
    await this.notify({
      severity: "critical",
      title: `Reporter ${this.route.id}: operation needs attention`,
      body: reason,
      dedupKey: `${NOTIFY_PREFIX}:${this.route.id}:attention:${operation.id}`,
      operationId: operation.id,
      action,
    });
  }

  private describeOutcome(outcome: SubmitOutcome): string {
    switch (outcome.status) {
      case "replaced":
        return `replaced (by ${outcome.replacedByHash ?? "an unknown transaction"})`;
      case "unknown":
        return `unknown (${outcome.detail})`;
      default:
        return outcome.status;
    }
  }

  /** Loop-owned suspension reasons that hold before any planning or funding submit. */
  private async suspensionReason(): Promise<string | null> {
    if (!this.ctx.thresholds) return `no costPerMessage configured for route ${this.route.id}`;
    const attention = await this.attentionReason();
    if (attention) return attention;
    const preflight = await this.deps.funding.preflight(this.route);
    if (!preflight.ok) return `preflight failed: ${preflight.reasons.join("; ")}`;
    return null;
  }

  private async attentionReason(): Promise<string | null> {
    const attention = await this.deps.ports.journal.listOperations({
      kind: "reporter-funding",
      routeId: this.route.id,
      status: "attention",
    });
    return attention.length > 0 ? `operation ${attention[0]!.id} needs attention` : null;
  }

  private fundKey(operation: Operation): string {
    return `op:${operation.id}:step:fund`;
  }

  /**
   * The sources are in the route's holding but the route may not be funded this tick. Unavailable: wait, nothing
   * debited. Suspended: the operation closes `failed` before any debit; the sourced funds stay in
   * `bridging:<route>` and the next operation, once the suspension clears, funds from them as a holding leg.
   */
  private async blockedBeforeDebit(operation: Operation, state: FundingState, gate: FundingGate): Promise<Progress> {
    this.deps.ports.logger.warn("reporter funding not submitted", {
      loop: this.id,
      operationId: operation.id,
      gate: gate.kind,
      reason: gate.reason,
    });
    if (gate.kind === "unavailable") return "waiting";
    await this.deps.ports.journal.updateOperation(operation.id, {
      step: "funding-blocked",
      stepPayload: state as unknown as JsonValue,
      status: "failed",
      lastError: `funding not submitted: ${gate.reason}`,
    });
    await this.notify({
      severity: "warning",
      title: `Reporter ${this.route.id}: funding not submitted`,
      body:
        `The route is suspended (${gate.reason}); operation ${operation.id} closes before funding. ` +
        `Its sourced funds stay in ${scopeKey(this.ctx.scope)}.`,
      dedupKey: `${NOTIFY_PREFIX}:${this.route.id}:funding-blocked:${operation.id}`,
      operationId: operation.id,
      action: "Fix the suspension cause; the next operation funds the reporter from the holding.",
    });
    return "closed";
  }

  /**
   * A resume at the `funding` marker found no funding submitted (a crash between the marker and the submit) while
   * the route may not be funded. Unavailable: wait. Suspended: the debit is credited back through the `crediting`
   * bracket and the operation closes `failed`.
   */
  private async blockedAfterDebit(operation: Operation, state: FundingState, gate: FundingGate): Promise<Progress> {
    this.deps.ports.logger.warn("reporter funding not submitted after its debit", {
      loop: this.id,
      operationId: operation.id,
      gate: gate.kind,
      reason: gate.reason,
    });
    if (gate.kind === "unavailable") return "waiting";
    state.refund = {
      outcome: "not-submitted",
      detail: `was not submitted: ${gate.reason}`,
      hash: null,
      holdingBefore: await localHolding(this.deps.ports.journal, this.ctx),
    };
    await this.save(operation, "crediting", state);
    return this.creditBack(operation, state);
  }

  /** The reason of the suspension last recorded, or `null`. */
  private async recordedSuspension(): Promise<string | null> {
    const key = suspendedObservationKey(this.route.id);
    const value = (await this.deps.ports.journal.observations(key)).find((o) => o.key === key)?.value as
      | { suspended?: boolean; reason?: string | null }
      | null
      | undefined;
    return value?.suspended === true ? (value.reason ?? "suspended") : null;
  }

  private async notifyUnavailable(detail: string): Promise<void> {
    this.deps.ports.logger.warn("reporter preflight unavailable; deferred", { loop: this.id, detail });
    await this.notify({
      severity: "warning",
      title: `Reporter ${this.route.id}: preflight unavailable`,
      body: `${detail}. No funding is initiated until the preflight can be evaluated; retried every tick.`,
      dedupKey: `${NOTIFY_PREFIX}:${this.route.id}:preflight-unavailable`,
      action: "Check the RPC of the reporter's chain if this persists; verify the reporter pays native fees.",
    });
  }

  private async recordSuspension(reason: string | null, now: Date): Promise<void> {
    const { journal } = this.deps.ports;
    const key = suspendedObservationKey(this.route.id);
    const previous = (await journal.observations(key)).find((o) => o.key === key)?.value as
      | { suspended?: boolean; reason?: string | null }
      | null
      | undefined;
    const wasSuspended = previous?.suspended === true;
    if (reason) {
      if (wasSuspended && previous?.reason === reason) return;
      await journal.recordObservation(key, { suspended: true, reason, since: now.toISOString() }, now);
      await this.notify({
        severity: "critical",
        title: `Reporter ${this.route.id} suspended`,
        body: `${reason}. Open operations keep advancing; no new funding is initiated.`,
        dedupKey: `${NOTIFY_PREFIX}:${this.route.id}:suspended:${reason}`,
        action:
          "Fix the cause (configuration, reporter address, or the operation needing attention); " +
          "the loop resumes by itself.",
      });
    } else if (wasSuspended) {
      await journal.recordObservation(key, { suspended: false, reason: null, since: now.toISOString() }, now);
      await this.notify({
        severity: "info",
        title: `Reporter ${this.route.id} resumed`,
        body: `The suspension reason no longer holds: ${previous?.reason ?? "unknown"}.`,
        dedupKey: `${NOTIFY_PREFIX}:${this.route.id}:resumed`,
      });
    }
  }

  private async recordCapacity(
    plan: FundingPlan | undefined,
    reason: string | null,
    openOperation: string | null,
    now: Date
  ): Promise<void> {
    let balance: bigint | null = plan && plan.kind !== "suspend" ? plan.balance : null;
    if (balance === null) {
      try {
        balance = await this.deps.funding.balance(this.route);
      } catch {
        balance = null;
      }
    }
    const thresholds = this.ctx.thresholds;
    await this.deps.ports.journal.recordObservation(
      `reporter:${this.route.id}`,
      {
        routeId: this.route.id,
        pairId: this.route.pairId,
        chainId: this.route.chainId,
        reporter: this.route.reporter,
        balance,
        lowWater: thresholds?.lowWater ?? null,
        target: thresholds?.target ?? null,
        costPerMessage: thresholds?.costPerMessage ?? null,
        holding: await localHolding(this.deps.ports.journal, this.ctx),
        suspended: reason !== null,
        reason,
        openOperation,
      },
      now
    );
  }

  private async notifyShort(reason: string, balance: bigint, target: bigint): Promise<void> {
    await this.notify({
      severity: "warning",
      title: `Reporter ${this.route.id} low; funding deferred`,
      body: `Balance ${balance} below low-water (target ${target}): ${reason}.`,
      dedupKey: `${NOTIFY_PREFIX}:${this.route.id}:short`,
      action: "None required while bridging fees accrue; check the reporter's message volume if this persists.",
    });
  }

  private async notify(notification: Omit<Notification, "routeId" | "pairId" | "chainId">): Promise<void> {
    await this.deps.ports.notifier.notify({
      ...notification,
      routeId: this.route.id,
      pairId: this.route.pairId,
      chainId: this.route.chainId,
    });
  }
}
