import { keccak256, stringToHex } from "viem";
import type { PairConfig } from "../config/schema";
import {
  InsufficientClaimable,
  InsufficientHolding,
  type CorePorts,
  type ForeignGatewayBalance,
  type ForeignGatewayTreasury,
  type HomeGatewayFunding,
  type PriceOracle,
  type SubmitOutcome,
  type TransferOutcome,
  type Transfers,
} from "../ports";
import {
  NATIVE,
  sameScope,
  type AccountingScope,
  type Asset,
  type Hex,
  type JsonValue,
  type Loop,
  type Notification,
  type Operation,
  type TickContext,
  type TickResult,
} from "../domain";
import { convertAtPrices, priceSymbol } from "../lifi/slippage";
import { neverSigned } from "../lifi/transfers";
import { pairRefillSettings, type PairRefillSettings } from "./config";
import { arbitrationClaimKey, capacityOf, planRefill, type SweepItem } from "./planner";

/**
 * One HomeGateway refill loop per pair. Each refill is one journaled operation that walks its swept assets one
 * at a time: claim, withdraw, credit the withdrawn amount to `arbitration:<pair>` on the foreign chain, hand it
 * to `Transfers` (which owns the ledger moves to the home chain), then deposit exactly the `receivedByScope`
 * amount persisted in the step payload. Ledger writes are bracketed by step markers (`*:debiting`,
 * `*:crediting`); a resume at a marker is `attention`.
 */

interface RefillPayload {
  pairId: string;
  availableNative: bigint;
  lowWater: bigint;
  target: bigint;
  expectedEth: bigint | null;
  partial: boolean | null;
  items: SweepItem[];
}

interface RefillState {
  index: number;
  attempt: number;
  claimId: string | null;
  withdrawn: bigint | null;
  depositAmount: bigint | null;
  deposited: bigint;
  txHashes: Hex[];
  skipped: string[];
  /** Consecutive ambiguous `Transfers` deferrals of the current item, and when the first one happened. */
  ambiguousDeferrals?: number;
  firstAmbiguousDeferralAt?: string | null;
  /** Only inside the `deposit:recorded` marker: the spend row being written. */
  pendingSpend?: { amount: bigint; at: string };
}

type StepResult =
  | { kind: "continue" }
  | { kind: "wait"; summary: string }
  | { kind: "finished"; summary: string }
  | { kind: "attention"; reason: string };

interface Suspension {
  active: boolean;
  kind: "policy" | "attention" | null;
  reason: string | null;
  fingerprint: string | null;
  since: string | null;
}

const MAX_STEPS_PER_TICK = 16;

/** A submit `failed` before signing (shutdown, an expired wait budget, a crash; decisions [L61], [L65]). */
export function isAborted(error: string): boolean {
  return error.startsWith("aborted:");
}

function json(value: unknown): JsonValue {
  return value as JsonValue;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export interface RefillLoopDeps {
  ports: CorePorts;
  pair: PairConfig;
  treasury: ForeignGatewayTreasury;
  home: HomeGatewayFunding;
  transfers: Transfers;
  priceOracle: PriceOracle;
}

export class RefillLoop implements Loop {
  readonly id: string;
  private readonly scope: AccountingScope;
  private readonly settings: PairRefillSettings;
  private readonly homeNative: Asset;

  constructor(private readonly deps: RefillLoopDeps) {
    this.id = `refill:${deps.pair.id}`;
    this.scope = { kind: "arbitration", pairId: deps.pair.id };
    this.settings = pairRefillSettings(deps.ports.config.refill, deps.pair.id);
    const homeChain = deps.ports.config.topology.chains.find((c) => c.id === deps.pair.homeChainId);
    this.homeNative = {
      chainId: deps.pair.homeChainId,
      address: NATIVE,
      symbol: homeChain?.nativeSymbol ?? "ETH",
      decimals: homeChain?.nativeDecimals ?? 18,
    };
  }

  private get ports(): CorePorts {
    return this.deps.ports;
  }

  private get journal() {
    return this.deps.ports.journal;
  }

  async tick(_: TickContext): Promise<TickResult> {
    try {
      return await this.run();
    } catch (error) {
      return { status: "failed", summary: `refill ${this.deps.pair.id}: ${messageOf(error)}` };
    }
  }

  private async run(): Promise<TickResult> {
    const { pair } = this.deps;
    const now = this.ports.clock.now();
    const availableNative = await this.deps.home.availableNative();
    const balances = await this.deps.treasury.balances();
    await this.observe(availableNative, balances, now);

    const suspension = await this.evaluateSuspension();
    const [open] = await this.journal.listOperations({ kind: "refill", pairId: pair.id, status: "open" });
    if (open) return this.afterAdvance(open.id, await this.advance(open, balances));
    if (suspension.active) return { status: "suspended", summary: `suspended: ${suspension.reason}` };
    return this.plan(availableNative, balances, now);
  }

  /**
   * An open operation is `deferred` (waiting) even while suspended; `suspended` only once nothing is open; a
   * completed operation is `acted`.
   */
  private async afterAdvance(operationId: string, summary: string): Promise<TickResult> {
    const suspension = await this.evaluateSuspension();
    const after = await this.journal.getOperation(operationId);
    if (after?.status === "open") {
      return {
        status: "deferred",
        summary: `${summary}${suspension.active ? ` (suspended: ${suspension.reason})` : ""}`,
      };
    }
    if (suspension.active) return { status: "suspended", summary: `${summary}; suspended: ${suspension.reason}` };
    return { status: after?.status === "completed" ? "acted" : "deferred", summary };
  }

  private async observe(availableNative: bigint, balances: ForeignGatewayBalance[], now: Date): Promise<void> {
    const { pair } = this.deps;
    const capacity = capacityOf(availableNative, this.settings);
    await this.journal.recordObservation(
      `capacity:${pair.id}`,
      json({
        availableNative,
        lowWater: capacity?.lowWater ?? null,
        target: capacity?.target ?? null,
        cases: capacity?.cases ?? null,
        referenceCaseCost: this.settings.referenceCaseCostWei,
        chainId: pair.homeChainId,
      }),
      now
    );
    for (const balance of balances) {
      await this.journal.recordObservation(
        `withdrawable:${pair.id}:${balance.asset.symbol}`,
        json({
          asset: balance.asset.address,
          chainId: balance.asset.chainId,
          total: balance.total,
          arbitration: balance.arbitration,
          bridging: balance.bridging,
          atBlock: balance.atBlock,
        }),
        now
      );
    }
  }

  private notify(notification: Omit<Notification, "pairId">): Promise<void> {
    return this.ports.notifier.notify({ ...notification, pairId: this.deps.pair.id });
  }

  // --- suspension (loop-owned, see decisions.md) ---

  private fingerprint(): string {
    const { lifi, refill } = this.ports.config;
    return keccak256(stringToHex(JSON.stringify({ lifi, refill })));
  }

  private async readSuspension(): Promise<Suspension> {
    const [observation] = await this.journal.observations(`suspended:${this.id}`);
    const value = observation?.value as Suspension | null | undefined;
    if (!value || typeof value !== "object" || !value.active) {
      return { active: false, kind: null, reason: null, fingerprint: null, since: null };
    }
    return value;
  }

  private async suspend(kind: "policy" | "attention", reason: string): Promise<Suspension> {
    const current = await this.readSuspension();
    if (current.active && current.kind === kind && current.reason === reason) return current;
    const suspension: Suspension = {
      active: true,
      kind,
      reason,
      fingerprint: this.fingerprint(),
      since: current.active ? current.since : this.ports.clock.now().toISOString(),
    };
    await this.journal.recordObservation(`suspended:${this.id}`, json(suspension), this.ports.clock.now());
    if (!current.active || current.kind !== kind) {
      await this.notify({
        severity: "critical",
        title: `Refill ${this.deps.pair.id} suspended`,
        body: `The refill loop initiates no new operation: ${reason}. Open operations keep advancing.`,
        dedupKey: `suspended:${this.id}:${kind}`,
        chainId: this.deps.pair.homeChainId,
        action:
          kind === "policy"
            ? "Review the LI.FI policy violation. A transient one (daily limit, budget, fee, prices) clears on its " +
              "own once a later quote of the open transfer passes; otherwise adjust the lifi allowlists or limits and " +
              "restart (the suspension also clears when the configuration changes)."
            : "Resolve the operations in attention (see `status`); the suspension clears when none is left.",
      });
    }
    return suspension;
  }

  /**
   * Re-derives the suspension: attention operations hold it; a policy suspension holds until the configuration
   * changes.
   */
  private async evaluateSuspension(): Promise<Suspension> {
    const attention = await this.journal.listOperations({
      kind: "refill",
      pairId: this.deps.pair.id,
      status: "attention",
    });
    if (attention.length > 0) {
      return this.suspend("attention", `operation(s) ${attention.map((op) => op.id).join(", ")} need attention`);
    }
    const current = await this.readSuspension();
    if (!current.active) return current;
    if (current.kind === "policy" && current.fingerprint === this.fingerprint()) return current;
    return this.clearSuspension(current, "the configuration changed or no operation needs attention");
  }

  private async clearSuspension(current: Suspension, why: string): Promise<Suspension> {
    const cleared: Suspension = { active: false, kind: null, reason: null, fingerprint: null, since: null };
    await this.journal.recordObservation(`suspended:${this.id}`, json(cleared), this.ports.clock.now());
    await this.notify({
      severity: "info",
      title: `Refill ${this.deps.pair.id} resumed`,
      body: `The suspension (${current.reason}) no longer holds: ${why}.`,
      dedupKey: `resumed:${this.id}:${current.since}`,
    });
    return cleared;
  }

  /**
   * A policy suspension clears on its own once a later evaluation of the open transfer passes the policy (S-8): a
   * daily limit whose window rolled, a budget or fee rejection after the market moved, prices back. Only an
   * outcome that shows an approved quote counts; a restart alone never clears anything.
   */
  private async clearPolicySuspension(why: string): Promise<void> {
    const current = await this.readSuspension();
    if (current.active && current.kind === "policy") await this.clearSuspension(current, why);
  }

  // --- planning ---

  private async plan(availableNative: bigint, balances: ForeignGatewayBalance[], now: Date): Promise<TickResult> {
    const { pair } = this.deps;
    const openClaims = new Map<string, bigint>();
    for (const balance of balances) {
      const key = arbitrationClaimKey(pair.id, balance.asset);
      const claims = await this.journal.ledger.openClaims(key);
      openClaims.set(
        key,
        claims.reduce((acc, c) => acc + c.amount, 0n)
      );
    }
    const ethValue = await this.ethValuer(balances.map((b) => b.asset));
    const plan = planRefill({
      pairId: pair.id,
      settings: this.settings,
      availableNative,
      balances,
      openClaims,
      ethValue,
    });
    switch (plan.kind) {
      case "not-configured":
        return { status: "idle", summary: `refill ${pair.id}: ${plan.reason}` };
      case "above-trigger":
        return {
          status: "idle",
          summary: `refill ${pair.id}: ${plan.capacity.cases} cases available, not below the trigger`,
        };
      case "nothing-to-sweep":
        await this.notify({
          severity: "warning",
          title: `HomeGateway ${pair.id} below low water, nothing to sweep`,
          body:
            `Available ${plan.capacity.availableNative} wei (${plan.capacity.cases} cases) is under the ` +
            `low-water mark ${plan.capacity.lowWater}; the ForeignGateway holds no withdrawable arbitration ` +
            `funds above the economic minimum` +
            (plan.deferred.length
              ? ` (deferred: ${plan.deferred.map((d) => `${d.amount} ${d.asset.symbol}`).join(", ")})`
              : "") +
            ".",
          dedupKey: `refill-empty:${pair.id}:${now.toISOString().slice(0, 10)}`,
          chainId: pair.homeChainId,
          action:
            "No action needed unless cases keep draining; the bot sweeps as soon as foreign arbitration fees " +
            "accumulate.",
        });
        return {
          status: "deferred",
          summary: `refill ${pair.id}: below the trigger, nothing above the economic minimum`,
        };
      case "sweep": {
        const payload: RefillPayload = {
          pairId: pair.id,
          availableNative,
          lowWater: plan.capacity.lowWater,
          target: plan.capacity.target,
          expectedEth: plan.expectedEth,
          partial: plan.partial,
          items: plan.sweep,
        };
        const op = await this.journal.createOperation({
          kind: "refill",
          description: `refill ${pair.id}: sweep ${plan.sweep.map((s) => `${s.amount} ${s.asset.symbol}`).join(", ")}`,
          scopes: [this.scope],
          pairId: pair.id,
          payload: json(payload),
        });
        if (plan.partial !== false) {
          await this.notify({
            severity: "warning",
            title: `Partial refill of HomeGateway ${pair.id}`,
            body:
              `Available ${availableNative} wei; the sweep brings about ` +
              `${plan.expectedEth ?? "an unknown amount of"} wei ` +
              `against a target of ${plan.capacity.target} (${this.settings.targetCases} cases)` +
              (plan.partial === null ? "; the value could not be priced" : "") +
              ".",
            dedupKey: `refill-partial:${op.id}`,
            operationId: op.id,
            chainId: pair.homeChainId,
            action:
              "No action required; the bot refills what the ForeignGateway holds. Top up manually if cases run short.",
          });
        }
        return this.afterAdvance(op.id, await this.advance(op, balances));
      }
    }
  }

  /** ETH value at oracle prices, resolved once per tick; null when a price is unavailable. */
  private async ethValuer(assets: Asset[]): Promise<(asset: Asset, amount: bigint) => bigint | null> {
    const symbols = this.ports.config.lifi.priceSymbols;
    const eth = priceSymbol(this.homeNative.symbol, symbols);
    const prices = new Map<string, bigint | null>();
    for (const symbol of new Set([eth, ...assets.map((a) => priceSymbol(a.symbol, symbols))])) {
      if (symbol === eth && assets.every((a) => priceSymbol(a.symbol, symbols) === eth)) continue;
      const result = await this.deps.priceOracle.price(symbol);
      prices.set(symbol, result.kind === "price" ? result.priceE18 : null);
    }
    return (asset, amount) => {
      const symbol = priceSymbol(asset.symbol, symbols);
      if (symbol === eth) return amount * 10n ** BigInt(Math.max(0, this.homeNative.decimals - asset.decimals));
      const from = prices.get(symbol);
      const to = prices.get(eth);
      if (!from || !to) return null;
      return convertAtPrices(
        amount,
        { decimals: asset.decimals, priceE18: from },
        { decimals: this.homeNative.decimals, priceE18: to }
      );
    };
  }

  // --- the operation's step machine ---

  private async advance(op: Operation, balances: ForeignGatewayBalance[]): Promise<string> {
    const payload = op.payload as unknown as RefillPayload;
    if (op.step.endsWith(":debiting") || op.step.endsWith(":crediting")) {
      await this.markAttention(
        op,
        `resumed inside the ledger bracket "${op.step}": the amount may be untracked; reconcile the ` +
          `arbitration:${payload.pairId} holdings by hand`
      );
      return `operation ${op.id} needs attention`;
    }
    const state: RefillState = (op.stepPayload as unknown as RefillState | null) ?? {
      index: 0,
      attempt: 0,
      claimId: null,
      withdrawn: null,
      depositAmount: null,
      deposited: 0n,
      txHashes: [],
      skipped: [],
    };
    let step = op.step === "created" ? "claim" : op.step;
    for (let i = 0; i < MAX_STEPS_PER_TICK; i++) {
      let result: StepResult;
      const item = payload.items[state.index];
      if (step === "deposit:recorded") {
        // Checked before the item: the marker already points at the next item, which may not exist.
        result = await this.depositRecordedResume(op, state);
      } else if (!item) {
        result = await this.finish(op, payload, state);
      } else {
        switch (step) {
          case "claim":
            result = await this.claim(op, item, state, balances);
            break;
          case "withdraw":
            result = await this.withdraw(op, payload, item, state);
            break;
          case "transfer":
            result = await this.transfer(op, item, state);
            break;
          case "deposit":
            result = await this.deposit(op, state);
            break;
          case "deposit:submit":
            result = await this.submitDeposit(op, state);
            break;
          default:
            result = { kind: "attention", reason: `unknown refill step "${step}"` };
        }
      }
      if (result.kind === "attention") {
        await this.markAttention(op, result.reason, state.txHashes);
        return `operation ${op.id} needs attention: ${result.reason}`;
      }
      if (result.kind === "wait" || result.kind === "finished") return result.summary;
      const current = await this.journal.getOperation(op.id);
      step = current?.step ?? step;
    }
    return `operation ${op.id} advanced`;
  }

  private save(op: Operation, step: string, state: RefillState) {
    return this.journal.updateOperation(op.id, { step, stepPayload: json(state) });
  }

  private nextItem(state: RefillState): void {
    state.index += 1;
    state.attempt = 0;
    state.claimId = null;
    state.withdrawn = null;
    state.depositAmount = null;
    state.ambiguousDeferrals = 0;
    state.firstAmbiguousDeferralAt = null;
  }

  private key(op: Operation, name: string, attempt: number): string {
    return `op:${op.id}:step:${name}${attempt > 0 ? `:${attempt}` : ""}`;
  }

  private async markAttention(op: Operation, reason: string, txHashes: Hex[] = []): Promise<void> {
    await this.journal.updateOperation(op.id, { status: "attention", lastError: reason });
    await this.notify({
      severity: "critical",
      title: `Refill ${this.deps.pair.id} needs attention`,
      body: `Operation ${op.id}: ${reason}`,
      dedupKey: `refill-attention:${op.id}`,
      operationId: op.id,
      chainId: this.deps.pair.homeChainId,
      txHashes,
      action:
        "Inspect the operation's transactions and holdings (`status`), resolve the funds by hand, then mark the " +
        "operation resolved; the loop stays suspended until no refill operation of this pair needs attention.",
    });
    await this.suspend("attention", `operation(s) ${op.id} need attention`);
  }

  private async claim(
    op: Operation,
    item: SweepItem,
    state: RefillState,
    balances: ForeignGatewayBalance[]
  ): Promise<StepResult> {
    const ledger = this.journal.ledger;
    const existing = (await ledger.openClaims(item.claimKey)).find((c) => c.operationId === op.id);
    if (existing) {
      state.claimId = existing.id;
    } else {
      const balance = balances.find((b) => b.asset.address.toLowerCase() === item.asset.address.toLowerCase());
      try {
        const claim = await ledger.claim({
          key: item.claimKey,
          amount: item.amount,
          operationId: op.id,
          onchainAvailable: balance?.arbitration ?? 0n,
        });
        state.claimId = claim.id;
      } catch (error) {
        if (!(error instanceof InsufficientClaimable)) throw error;
        state.skipped.push(`${item.asset.symbol}: ${error.message}`);
        this.nextItem(state);
        await this.save(op, "claim", state);
        return { kind: "continue" };
      }
    }
    await this.save(op, "withdraw", state);
    return { kind: "continue" };
  }

  private async withdraw(
    op: Operation,
    payload: RefillPayload,
    item: SweepItem,
    state: RefillState
  ): Promise<StepResult> {
    const ledger = this.journal.ledger;
    const tx = await this.deps.treasury.withdrawTx({
      category: "arbitration",
      asset: item.asset,
      amount: item.amount,
      recipient: this.ports.signer,
    });
    const outcome = await this.ports.executor.submit(tx, {
      idempotencyKey: this.key(op, `withdraw-${state.index}`, state.attempt),
      operationId: op.id,
    });
    switch (outcome.status) {
      case "confirmed": {
        state.txHashes.push(outcome.hash);
        if (state.claimId) await ledger.settleClaim(state.claimId, item.amount);
        state.withdrawn = item.amount;
        await this.save(op, "withdraw:crediting", state);
        await ledger.credit({
          scope: this.scope,
          chainId: item.asset.chainId,
          asset: item.asset.address,
          location: "eoa",
          amount: item.amount,
          operationId: op.id,
          reason: "foreign arbitration withdrawal",
        });
        await this.save(op, "transfer", state);
        return { kind: "continue" };
      }
      case "pending":
        return { kind: "wait", summary: `withdrawal of ${item.asset.symbol} pending` };
      case "failed": {
        if (isAborted(outcome.error)) {
          // Shutdown or an expired wait budget before signing (decisions [L61]): not a contract rejection. The claim
          // stays, and the next tick retries under a new attempt key; no skip, no notification, no suspension.
          state.attempt += 1;
          await this.save(op, "withdraw", state);
          return { kind: "wait", summary: `withdrawal of ${item.asset.symbol} aborted before signing; retrying` };
        }
        // Never broadcast (a stale balance after another withdrawal): release the claim, re-read next tick.
        if (state.claimId) await ledger.releaseClaim(state.claimId);
        state.skipped.push(`${item.asset.symbol}: withdrawal failed: ${outcome.error}`);
        this.nextItem(state);
        await this.save(op, "claim", state);
        if (!payload.items[state.index]) return this.finish(op, payload, state);
        return { kind: "wait", summary: `withdrawal of ${item.asset.symbol} failed; claim released, deferred` };
      }
      case "reverted":
        if (state.claimId) await ledger.releaseClaim(state.claimId);
        return { kind: "attention", reason: `withdrawal of ${item.asset.symbol} ${this.describe(outcome)}` };
      default:
        return { kind: "attention", reason: `withdrawal of ${item.asset.symbol} ${this.describe(outcome)}` };
    }
  }

  private describe(outcome: SubmitOutcome): string {
    switch (outcome.status) {
      case "reverted":
        return `reverted (${outcome.reason ?? "no reason"})`;
      case "replaced":
        return `was replaced by ${outcome.replacedByHash ?? "an unknown transaction"}`;
      case "unknown":
        return `is in an unknown state (${outcome.detail})`;
      default:
        return outcome.status;
    }
  }

  private async transfer(op: Operation, item: SweepItem, state: RefillState): Promise<StepResult> {
    const { pair } = this.deps;
    const amount = state.withdrawn;
    if (amount === null) return { kind: "attention", reason: "transfer step without a withdrawn amount" };
    const outcome: TransferOutcome = await this.deps.transfers.run({
      parentOperationId: op.id,
      tag: `withdraw-${state.index}`,
      fromChainId: item.asset.chainId,
      fromAsset: item.asset,
      amount,
      toChainId: pair.homeChainId,
      toAsset: this.homeNative,
      allocations: [{ scope: this.scope, amount }],
      purpose: "refill",
    });
    switch (outcome.status) {
      case "completed": {
        for (const hash of outcome.txHashes) if (!state.txHashes.includes(hash)) state.txHashes.push(hash);
        const share = outcome.receivedByScope.find((s) => sameScope(s.scope, this.scope));
        state.depositAmount = share?.amount ?? 0n;
        state.attempt = 0;
        if (state.depositAmount <= 0n) {
          this.nextItem(state);
          await this.save(op, "claim", state);
        } else {
          await this.save(op, "deposit", state);
        }
        return { kind: "continue" };
      }
      case "in-progress":
        await this.resetDeferrals(op, state);
        if (outcome.step.startsWith("policy-rejected")) await this.suspend("policy", outcome.step);
        // Waiting for a route, for the inbound slot of the destination (before the send-time policy check) or after
        // an error is no evidence that a quote passed.
        else if (!/^(awaiting-route|awaiting-inbound-slot|error)/.test(outcome.step)) {
          await this.clearPolicySuspension(`transfer ${outcome.operationId} passed the policy (${outcome.step})`);
        }
        return { kind: "wait", summary: `transfer of ${item.asset.symbol} in progress (${outcome.step})` };
      case "deferred":
        return this.deferred(op, item, state, outcome.reason);
      case "attention":
        return { kind: "attention", reason: `transfer ${outcome.operationId}: ${outcome.reason}` };
      case "failed":
        return { kind: "attention", reason: `transfer ${outcome.operationId} failed: ${outcome.reason}` };
    }
  }

  private async resetDeferrals(op: Operation, state: RefillState): Promise<void> {
    if (!state.ambiguousDeferrals && !state.firstAmbiguousDeferralAt) return;
    state.ambiguousDeferrals = 0;
    state.firstAmbiguousDeferralAt = null;
    await this.save(op, "transfer", state);
  }

  /**
   * A `Transfers` deferral, decided by its reason code (decisions [L20]); nothing was started, the operation stays at
   * `transfer` and the withdrawn funds stay in the EOA under `arbitration:<pair>`.
   */
  private async deferred(op: Operation, item: SweepItem, state: RefillState, reason: string): Promise<StepResult> {
    const { pair } = this.deps;
    const wait: StepResult = { kind: "wait", summary: `transfer of ${item.asset.symbol} deferred: ${reason}` };
    if (reason.startsWith("allocations-mismatch:"))
      return { kind: "attention", reason: `transfer deferred: ${reason}` };
    if (reason.startsWith("policy-rejected:")) {
      await this.resetDeferrals(op, state);
      await this.suspend("policy", reason);
      return wait;
    }
    if (reason.startsWith("no-route:")) {
      await this.resetDeferrals(op, state);
      await this.notify({
        severity: "warning",
        title: `No approved LI.FI route for ${item.asset.symbol} -> ETH (${pair.id})`,
        body:
          `${reason}. The withdrawn funds stay in the EOA under arbitration:${pair.id}; ` +
          "the bot retries every tick.",
        dedupKey: `refill-no-route:${op.id}:${state.index}`,
        operationId: op.id,
        chainId: item.asset.chainId,
        action: "Run `lifi-probe` for this route class; approve a route in the lifi allowlists if one is acceptable.",
      });
      return wait;
    }
    if (reason.startsWith("price-unavailable:")) {
      await this.resetDeferrals(op, state);
      await this.notify({
        severity: "warning",
        title: `Refill ${pair.id} waits for prices`,
        body:
          `Operation ${op.id} cannot set its loss budget: ${reason}. The withdrawn ${item.asset.symbol} stays in ` +
          `the EOA under arbitration:${pair.id}; the bot retries every tick.`,
        dedupKey: `refill-price:${op.id}`,
        operationId: op.id,
        chainId: item.asset.chainId,
        action:
          "Check the price providers (`price:*` observations in `status`); no action is needed once they recover.",
      });
      return wait;
    }
    // `insufficient-holding:` or an unrecognised reason: ambiguous, bounded (never another scope, never a new bridge).
    const now = this.ports.clock.now();
    state.ambiguousDeferrals = (state.ambiguousDeferrals ?? 0) + 1;
    state.firstAmbiguousDeferralAt ??= now.toISOString();
    await this.save(op, "transfer", state);
    const { maxAmbiguousDeferrals, ambiguousDeferralMaxAgeSeconds } = this.ports.config.refill;
    const age = now.getTime() - new Date(state.firstAmbiguousDeferralAt).getTime();
    if (state.ambiguousDeferrals >= maxAmbiguousDeferrals || age >= ambiguousDeferralMaxAgeSeconds * 1000) {
      return {
        kind: "attention",
        reason:
          `transfer deferred ${state.ambiguousDeferrals} times since ${state.firstAmbiguousDeferralAt} ` +
          `(${reason}); reconcile the arbitration:${pair.id} holding with the EOA balance`,
      };
    }
    await this.notify({
      severity: "warning",
      title: `Refill ${pair.id}: transfer deferred`,
      body:
        `Operation ${op.id} could not start its ${item.asset.symbol} transfer: ${reason}. Retried up to ` +
        `${maxAmbiguousDeferrals} times or ${ambiguousDeferralMaxAgeSeconds} s, then the operation needs attention.`,
      dedupKey: `refill-deferred:${op.id}:${state.index}`,
      operationId: op.id,
      chainId: item.asset.chainId,
      action:
        "Compare the arbitration holding on the foreign chain (`status`) with the EOA balance; the ledger may be " +
        "short after a crash.",
    });
    return wait;
  }

  private async deposit(op: Operation, state: RefillState): Promise<StepResult> {
    const amount = state.depositAmount;
    if (amount === null || amount <= 0n)
      return { kind: "attention", reason: "deposit step without a persisted amount" };
    await this.save(op, "deposit:debiting", state);
    try {
      await this.journal.ledger.debit({
        scope: this.scope,
        chainId: this.homeNative.chainId,
        asset: NATIVE,
        location: "eoa",
        amount,
        operationId: op.id,
        reason: "HomeGateway deposit",
      });
    } catch (error) {
      if (!(error instanceof InsufficientHolding)) throw error;
      await this.save(op, "deposit", state);
      await this.notify({
        severity: "warning",
        title: `Refill ${this.deps.pair.id}: deposit exceeds the holding`,
        body:
          `Operation ${op.id} would deposit ${amount} wei but arbitration:${this.deps.pair.id} holds ` +
          `${error.available} on chain ${this.homeNative.chainId}.`,
        dedupKey: `refill-holding:${op.id}`,
        operationId: op.id,
        chainId: this.homeNative.chainId,
        action: "Reconcile the arbitration holding with the EOA balance; the deposit is retried every tick.",
      });
      return { kind: "wait", summary: `deposit deferred: ${error.message}` };
    }
    await this.save(op, "deposit:submit", state);
    return { kind: "continue" };
  }

  private async submitDeposit(op: Operation, state: RefillState): Promise<StepResult> {
    const amount = state.depositAmount;
    if (amount === null || amount <= 0n) return { kind: "attention", reason: "deposit without a persisted amount" };
    const tx = await this.deps.home.depositTx(amount);
    if (tx.value !== amount || tx.chainId !== this.homeNative.chainId) {
      return { kind: "attention", reason: "deposit transaction does not carry exactly the persisted native amount" };
    }
    const depositKey = this.key(op, `deposit-${state.index}`, state.attempt);
    const outcome = await this.ports.executor.submit(tx, { idempotencyKey: depositKey, operationId: op.id });
    switch (outcome.status) {
      case "confirmed": {
        // Marker first, then the spend row (decisions: spend rows idempotent per (operation, step) or after the
        // marker): the `deposit:recorded` marker persists `deposited` and the next item, so a crash between the two
        // writes loses at most the spend row (a resume warns), never deposits or counts the amount twice.
        state.txHashes.push(outcome.hash);
        state.deposited += amount;
        const spend = { amount, at: this.ports.clock.now().toISOString() };
        this.nextItem(state);
        await this.save(op, "deposit:recorded", { ...state, pendingSpend: spend });
        await this.journal.ledger.recordSpend({
          chainId: this.homeNative.chainId,
          asset: NATIVE,
          category: "deposit",
          amount,
          operationId: op.id,
          at: new Date(spend.at),
        });
        await this.save(op, "claim", state);
        return { kind: "continue" };
      }
      case "pending":
        return { kind: "wait", summary: `deposit of ${amount} wei pending` };
      case "failed": {
        // Never signed: the debit is credited back, and a later tick retries under a new key. Defensive: only when
        // the journal agrees that no signed transaction exists under the key.
        if (!neverSigned(await this.journal.getTransaction(depositKey))) {
          return {
            kind: "attention",
            reason: `deposit submit returned failed but the record under ${depositKey} is not an unsigned failure`,
          };
        }
        await this.save(op, "deposit:crediting", state);
        await this.journal.ledger.credit({
          scope: this.scope,
          chainId: this.homeNative.chainId,
          asset: NATIVE,
          location: "eoa",
          amount,
          operationId: op.id,
          reason: "HomeGateway deposit failed before signing",
        });
        state.attempt += 1;
        await this.save(op, "deposit", state);
        return { kind: "wait", summary: `deposit failed (${outcome.error}); retrying next tick` };
      }
      default:
        return { kind: "attention", reason: `deposit of ${amount} wei ${this.describe(outcome)}` };
    }
  }

  /**
   * A resume at `deposit:recorded`: the deposit is confirmed and counted, but whether its `deposit` spend row was
   * written is unknown. The row is not written again (never twice); the operator is told it may be missing.
   */
  private async depositRecordedResume(op: Operation, state: RefillState): Promise<StepResult> {
    const { pendingSpend, ...rest } = state;
    await this.notify({
      severity: "warning",
      title: `Refill ${this.deps.pair.id}: deposit spend row may be missing`,
      body:
        `Operation ${op.id} resumed after a crash between a confirmed deposit` +
        (pendingSpend ? ` of ${pendingSpend.amount} wei at ${pendingSpend.at}` : "") +
        ` and its \`deposit\` spend row. The deposit is counted; the row is not written again.`,
      dedupKey: `refill-spend-row:${op.id}`,
      operationId: op.id,
      chainId: this.homeNative.chainId,
      action: "Check the spend history (`status`); a missing deposit row only under-reports deposit statistics.",
    });
    await this.save(op, "claim", rest);
    return { kind: "continue" };
  }

  private async finish(op: Operation, payload: RefillPayload, state: RefillState): Promise<StepResult> {
    const { pair } = this.deps;
    if (state.deposited === 0n) {
      await this.journal.updateOperation(op.id, {
        step: "done",
        stepPayload: json(state),
        status: "failed",
        lastError: `nothing deposited: ${state.skipped.join("; ") || "no amount received"}`,
      });
      return { kind: "finished", summary: `refill ${op.id} deposited nothing` };
    }
    await this.journal.updateOperation(op.id, { step: "done", stepPayload: json(state), status: "completed" });
    const available = await this.deps.home.availableNative().catch(() => null);
    await this.notify({
      severity: "info",
      title: `HomeGateway ${pair.id} refilled`,
      body:
        `Operation ${op.id} deposited ${state.deposited} wei of native ETH` +
        (available !== null ? `; the gateway now holds ${available} wei (target ${payload.target})` : "") +
        (state.skipped.length ? `; skipped: ${state.skipped.join("; ")}` : "") +
        ".",
      dedupKey: `refill-done:${op.id}`,
      operationId: op.id,
      chainId: pair.homeChainId,
      txHashes: state.txHashes,
    });
    return { kind: "finished", summary: `refill ${op.id} completed: deposited ${state.deposited} wei` };
  }
}
