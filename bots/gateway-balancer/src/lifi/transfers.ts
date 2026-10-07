import { encodeFunctionData, erc20Abi, parseUnits } from "viem";
import {
  NATIVE,
  lossBps,
  parseScopeKey,
  sameAsset,
  scopeKey,
  splitProRata,
  type AccountingScope,
  type Address,
  type Asset,
  type ChainId,
  type Hex,
  type JsonValue,
  type Operation,
  type OperationId,
  type TxRequest,
} from "../domain";
import type {
  CorePorts,
  PriceOracle,
  QuoteResult,
  RouteProvider,
  RouteQuote,
  RouteRequest,
  SubmitOutcome,
  TransactionReceiptView,
  TransactionRecord,
  TransferAllocation,
  TransferIntent,
  TransferOutcome,
  Transfers,
} from "../ports";
import { unwrapTx } from "../gateway/homeGateway";
import type { LifiConfig } from "./config";
import { findLimit, type Continuation } from "./policy";
import { isRechecking, type QuoteOptions, type RecheckingRouteProvider } from "./provider";
import { computeBaseline, legMinimumOutput, minimumAcceptableOutput, withinBudget } from "./slippage";

/**
 * The persisted bridge-and-swap step machine. One child operation (`kind: "transfer"`) per (parent, tag); each
 * `run` performs at most one step or one status poll and returns. Steps:
 *
 *   created -> [approve] -> send -> bridging -> [unwrap] -> completed
 *                                     \-> (bridge done, destination swap failed) requote -> [approve] -> send ...
 *
 * Ledger moves are owned here: on the first send each allocation moves from the source `eoa` holding to
 * `in-transit`; on receipt `in-transit` is debited and the destination `eoa` holding credited with LI.FI's reported
 * amount, split pro-rata. A native fee LI.FI charges on top of the input (part of the send's value) is debited in the
 * same bracket from the scopes' native `eoa` holdings on the source chain and credited back when nothing was signed;
 * operator gas never pays it. Every ledger write is bracketed by step markers (`*:debiting`, `*:crediting`): a resume
 * that finds a marker goes to `attention`, so a crash leaves money untracked, never counted twice.
 *
 * Verified credit (decisions [L39]): the credit is `min(status.received, quote estimate)`, only once the receiving
 * transaction is `success` and the destination chain's confirmations deep. Inbound legs are serialized per planned
 * (destination chain, asset): a leg is not sent while another open transfer to the same pair has been sent and has not
 * completed (unwrap included) or gone to `attention`. For an ERC20 delivery (WETH, a token, an intermediate asset) the
 * EOA's token balance must have risen, against the baseline recorded for that very token at send, by at least the
 * amount to credit; otherwise nothing is credited and after `creditCheckMaxTicks` checks or
 * `creditCheckMaxAgeSeconds` the transfer goes to `attention`. A native delivery is capped at the estimate and its
 * balance delta (net of this transfer's own gas) is only a `transfer-delta` observation and a warning.
 */

interface StoredStep {
  kind: string;
  chainId: ChainId;
  tool: string;
  target: Address;
  spender: Address | null;
  approvalAmount: bigint | null;
  tx: { chainId: ChainId; to: Address; data: Hex | null; value: bigint };
}

interface StoredQuote {
  id: string;
  tool: string;
  /** The quoted source side and gas, so the persisted quote can be re-evaluated (absent in older payloads). */
  fromChainId?: ChainId;
  toChainId?: ChainId;
  fromAsset?: Asset;
  gasCostsNative?: bigint;
  inputAmount: bigint;
  estimatedOutput: bigint;
  minimumOutput: bigint;
  feeCostsInOutput: bigint;
  toAsset: Asset;
  deliversWrapped: boolean;
  /** The bridge step's delivered token and estimate (from the LI.FI quote), when reported. */
  bridgeOutput?: { address: string; estimate: bigint | null } | null;
  steps: StoredStep[];
  quotedAt: string;
  /** `RouteQuote.raw.policy` of a LI.FI quote: what the policy needs to re-evaluate it before approval and send. */
  policy?: JsonValue | null;
}

/** A destination balance recorded at send, per asset (`native` or the lowercase token address). */
interface Baseline {
  asset: string;
  amount: bigint | null;
}

interface StoredAllocation {
  scope: string;
  amount: bigint;
}

interface Leg {
  fromChainId: ChainId;
  fromAsset: Asset;
  amount: bigint;
  /** Per scope, what this leg moved into `in-transit` (its quote's input split by the allocations). */
  sent: StoredAllocation[];
  quote: StoredQuote | null;
  /** Normalized fees of earlier legs, in the final output asset. */
  priorFees: bigint;
  /** The leg's `transfer` spend is recorded (once per leg, inside the send bracket; a retry never adds a row). */
  spendRecorded?: boolean;
  /** When that row was written; a row older than the rolling 24 hours no longer reserves the leg's input. */
  spendRecordedAt?: string;
  /**
   * Per scope, the native fee paid on top debited in the send bracket and credited back when nothing was signed
   * (absent in older payloads: a bracket written by an earlier version debited no fee).
   */
  feesOnTop?: StoredAllocation[];
}

interface TransferPayload {
  tag: string;
  fromChainId: ChainId;
  fromAsset: Asset;
  amount: bigint;
  toChainId: ChainId;
  toAsset: Asset;
  allocations: StoredAllocation[];
  purpose: string;
  /** The operation's baseline output at the oracle's prices, and the budget derived from it. */
  baseline: bigint;
  minimumAcceptable: bigint;
  maxLossBps: number;
}

interface StepState {
  legs: Leg[];
  attempt: number;
  /** Informational: the spender of the last confirmed approval. The decision reads the on-chain allowance. */
  approvedSpender: Address | null;
  /**
   * The approval's own attempt counter (decisions [L44]): `attempt` numbers the send and unwrap keys and is never
   * reset by an approval, so a send that failed under one key never reuses it after a re-approval.
   */
  approveAttempt?: number;
  sendHash: Hex | null;
  sentAt: string | null;
  lastPollAt: string | null;
  destBalanceBefore: bigint | null;
  /** Destination balances at send of every asset the credit gate may check (decisions [L39]). */
  baselines?: Baseline[];
  /** The transfer this one last warned it waits behind for the inbound slot (one warning per blocker). */
  slotWarnedFor?: OperationId | null;
  /** Failed credit verifications of the current delivery: the first one's time and how many. */
  creditCheck?: { since: string; count: number } | null;
  /**
   * Blocked ticks of the continuation leg: the first one's time and how many (decisions [L64]). A failed quote request
   * starts the time but adds no tick.
   */
  continuationBlocked?: { since: string; count: number } | null;
  /** Why the continuation was abandoned (step `release`), so a resume there raises the same attention and critical. */
  released?: { why: string; reason: string } | null;
  /** When LI.FI first reported the current leg DONE; the receipt-read bound runs from here (decisions [L67]). */
  doneSeenAt?: string | null;
  received: bigint | null;
  receivedAsset: Asset | null;
  receivingTxHash: Hex | null;
  txHashes: Hex[];
  timeoutWarned: boolean;
  outcome: JsonValue | null;
}

const MAX_LEGS = 2;
const DAY_MS = 24 * 60 * 60 * 1000;

function json(value: unknown): JsonValue {
  return value as JsonValue;
}

/** The bridge output a `LifiRouteProvider` quote carries in `raw` (absent for quotes built elsewhere). */
function bridgeOutputOf(raw: unknown): StoredQuote["bridgeOutput"] {
  const output = (raw as { bridgeOutput?: { address?: unknown; estimate?: unknown } } | null)?.bridgeOutput;
  if (!output || typeof output.address !== "string") return null;
  const estimate =
    typeof output.estimate === "string" && /^\d+$/.test(output.estimate) ? BigInt(output.estimate) : null;
  return { address: output.address, estimate };
}

function assetKey(address: string): string {
  return address === NATIVE ? NATIVE : address.toLowerCase();
}

export function storeQuote(quote: RouteQuote, at: Date): StoredQuote {
  const policy = (quote.raw as { policy?: unknown } | null)?.policy;
  return {
    id: quote.id,
    tool: quote.tool,
    fromChainId: quote.fromChainId,
    toChainId: quote.toChainId,
    fromAsset: { ...quote.fromAsset },
    gasCostsNative: quote.gasCostsNative,
    inputAmount: quote.inputAmount,
    estimatedOutput: quote.estimatedOutput,
    minimumOutput: quote.minimumOutput,
    feeCostsInOutput: quote.feeCostsInOutput,
    toAsset: { ...quote.toAsset },
    deliversWrapped: quote.deliversWrapped,
    bridgeOutput: bridgeOutputOf(quote.raw),
    steps: quote.steps.map((step) => ({
      kind: step.kind,
      chainId: step.chainId,
      tool: step.tool,
      target: step.target,
      spender: step.spender ?? null,
      approvalAmount: step.approvalAmount ?? null,
      tx: { chainId: step.tx.chainId, to: step.tx.to, data: step.tx.data ?? null, value: step.tx.value },
    })),
    quotedAt: at.toISOString(),
    policy: policy === undefined ? null : json(policy),
  };
}

/** The `RouteQuote` a persisted quote stands for, for the policy's re-evaluation; `leg` fills older payloads. */
export function quoteOf(
  stored: StoredQuote,
  leg: Pick<Leg, "fromChainId" | "fromAsset">,
  toChainId: ChainId
): RouteQuote {
  return {
    id: stored.id,
    tool: stored.tool,
    fromChainId: stored.fromChainId ?? leg.fromChainId,
    toChainId: stored.toChainId ?? toChainId,
    fromAsset: stored.fromAsset ?? leg.fromAsset,
    toAsset: stored.toAsset,
    inputAmount: stored.inputAmount,
    estimatedOutput: stored.estimatedOutput,
    minimumOutput: stored.minimumOutput,
    feeCostsInOutput: stored.feeCostsInOutput,
    gasCostsNative: stored.gasCostsNative ?? 0n,
    steps: stored.steps.map((step) => {
      const tx: TxRequest = { chainId: step.tx.chainId, to: step.tx.to, value: step.tx.value };
      if (step.tx.data) tx.data = step.tx.data;
      return {
        kind: step.kind as RouteQuote["steps"][number]["kind"],
        chainId: step.chainId,
        tool: step.tool,
        target: step.target,
        ...(step.spender ? { spender: step.spender } : {}),
        ...(step.approvalAmount !== null ? { approvalAmount: step.approvalAmount } : {}),
        tx,
      };
    }),
    deliversWrapped: stored.deliversWrapped,
    expiresAt: null,
    raw: { policy: stored.policy ?? null, bridgeOutput: stored.bridgeOutput ?? null },
  };
}

function txOf(step: StoredStep): TxRequest {
  if (step.kind === "approve") {
    // The bot encodes the bounded approval itself; it never signs API-provided approval calldata.
    if (!step.spender || step.approvalAmount === null) throw new Error("approval without a spender or a bound");
    return {
      chainId: step.tx.chainId,
      to: step.target,
      value: 0n,
      data: encodeFunctionData({ abi: erc20Abi, functionName: "approve", args: [step.spender, step.approvalAmount] }),
    };
  }
  const tx: TxRequest = { chainId: step.tx.chainId, to: step.tx.to, value: step.tx.value };
  if (step.tx.data) tx.data = step.tx.data;
  return tx;
}

/** How a fee paid on top that the scopes' native holdings cannot cover is worded (`feesOnTop`). */
const FEE_SHORTFALL = "value: the fee of";

/** The native value a leg's send carries beyond its own native input: LI.FI fees paid on top ([L49]). */
function feeOnTop(
  quote: { inputAmount: bigint; steps: readonly { kind: string; tx: { value: bigint } }[] },
  fromAsset: Pick<Asset, "address">
): bigint {
  const send = quote.steps.find((s) => s.kind !== "approve"); // the step `submitSend` signs
  const input = fromAsset.address === NATIVE ? quote.inputAmount : 0n;
  return send && send.tx.value > input ? send.tx.value - input : 0n;
}

/**
 * A `failed` record that never produced a signed transaction (the executor fails before signing). The frozen
 * `FakeExecutor` numbers its failed records, so the test is on the signed bytes and hash, which only signing sets.
 */
export function neverSigned(record: TransactionRecord | undefined): boolean {
  return record !== undefined && record.status === "failed" && record.signedRaw === null && record.hash === null;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export interface LifiTransfersDeps {
  ports: CorePorts;
  config: LifiConfig;
  routeProvider: RouteProvider;
  priceOracle: PriceOracle;
}

export class LifiTransfers implements Transfers {
  private readonly routeProvider: RecheckingRouteProvider;

  /**
   * Refuses a route provider without `recheck` (decisions [L55]): a persisted quote must be re-evaluated against the
   * current policy before its approval and its send, never silently skipped.
   */
  constructor(private readonly deps: LifiTransfersDeps) {
    if (!isRechecking(deps.routeProvider)) {
      throw new Error(
        "LifiTransfers needs a route provider with recheck (the LI.FI provider): a persisted quote is re-evaluated " +
          "against the current policy before approval and send"
      );
    }
    this.routeProvider = deps.routeProvider;
  }

  private get ports(): CorePorts {
    return this.deps.ports;
  }

  private get ledger() {
    return this.deps.ports.journal.ledger;
  }

  async run(intent: TransferIntent): Promise<TransferOutcome> {
    const child = await this.findChild(intent);
    if (!child) return this.start(intent);
    const payload = child.payload as unknown as TransferPayload;
    if (
      payload.amount !== intent.amount ||
      payload.fromChainId !== intent.fromChainId ||
      payload.toChainId !== intent.toChainId ||
      !sameAsset(payload.fromAsset, intent.fromAsset) ||
      !sameAsset(payload.toAsset, intent.toAsset)
    ) {
      return { status: "attention", operationId: child.id, reason: "intent differs from the recorded transfer" };
    }
    switch (child.status) {
      case "completed": {
        const state = child.stepPayload as unknown as StepState | null;
        if (state?.outcome) return state.outcome as unknown as TransferOutcome;
        return { status: "attention", operationId: child.id, reason: "completed transfer without a recorded outcome" };
      }
      case "attention":
        return { status: "attention", operationId: child.id, reason: child.lastError ?? "transfer needs attention" };
      case "failed":
        return { status: "failed", operationId: child.id, reason: child.lastError ?? "transfer failed" };
      case "open":
        try {
          return await this.advance(child, payload);
        } catch (error) {
          // An unexpected error leaves the step where it was; the next run retries it.
          return { status: "in-progress", operationId: child.id, step: `error: ${messageOf(error)}` };
        }
    }
  }

  private async findChild(intent: TransferIntent): Promise<Operation | undefined> {
    const children = await this.ports.journal.listOperations({ parentId: intent.parentOperationId, kind: "transfer" });
    return children.find((op) => (op.payload as { tag?: string } | null)?.tag === intent.tag);
  }

  private request(payload: TransferPayload, leg: Leg): RouteRequest {
    return {
      fromChainId: leg.fromChainId,
      fromAsset: leg.fromAsset,
      toChainId: payload.toChainId,
      toAsset: payload.toAsset,
      amount: leg.amount,
      sender: this.ports.signer,
      recipient: this.ports.signer,
      purpose: payload.purpose === "reporter" ? "reporter" : "refill",
      minimumOutput: legMinimumOutput(payload.minimumAcceptable, leg.priorFees),
    };
  }

  /** Quotes one leg; the budget is re-checked here so a provider without the policy cannot bypass it. */
  private async quoteLeg(
    payload: TransferPayload,
    leg: Leg,
    continuationOf?: Continuation
  ): Promise<
    { kind: "quote"; quote: RouteQuote } | { kind: "rejected"; reason: string } | { kind: "no-route"; reason: string }
  > {
    const request = this.request(payload, leg);
    const options: QuoteOptions = continuationOf ? { continuationOf } : {};
    const result: QuoteResult = await this.routeProvider.quote(request, options);
    if (result.kind === "no-route") return result;
    let quote: RouteQuote;
    if (result.kind === "rejected") {
      // A requote of a leg whose own `transfer` row is still in the window (a send that failed before signing): the
      // provider counted that row and the new input, the same money twice (decisions [L35]). When the daily limit is
      // the only violation, the send-time check, which counts the leg's own row once, decides instead.
      const onlyDaily = result.violations.length > 0 && result.violations.every((v) => v.startsWith("daily-limit:"));
      if (!(onlyDaily && result.quote && this.spendReserved(leg))) {
        return { kind: "rejected", reason: result.violations.join("; ") };
      }
      quote = result.quote;
    } else quote = result.quote;
    if (
      !withinBudget({
        legMinimum: request.minimumOutput ?? 0n,
        quoteMinimumOutput: quote.minimumOutput,
        feesInOutput: quote.feeCostsInOutput,
      })
    ) {
      return {
        kind: "rejected",
        reason:
          `budget: minimum output ${quote.minimumOutput} plus fees ${quote.feeCostsInOutput} is under ` +
          `${request.minimumOutput}`,
      };
    }
    if (quote.inputAmount > leg.amount) {
      return { kind: "rejected", reason: `amount: quote input ${quote.inputAmount} exceeds ${leg.amount}` };
    }
    const fees = await this.feesOnTop(payload, leg, quote);
    if (fees.shortfall) return { kind: "rejected", reason: fees.shortfall };
    return { kind: "quote", quote };
  }

  /**
   * The leg's native fee paid on top, split per scope like its input, and whether the scopes' native `eoa` holdings
   * on the leg's chain cover it (with the input too when that is native and still in `eoa`). Never a fallback to
   * another scope or to operator gas: a shortfall is a `value:` rejection. No ledger read when there is no fee.
   */
  private async feesOnTop(
    payload: TransferPayload,
    leg: Leg,
    quote: RouteQuote | StoredQuote
  ): Promise<{ shares: StoredAllocation[]; shortfall: string | null }> {
    const fee = feeOnTop(quote, leg.fromAsset);
    if (fee === 0n) return { shares: [], shortfall: null };
    // A continuation's in-transit booking, or the allocations of a first leg before its bracket.
    const weights = leg.sent.length > 0 ? leg.sent : payload.allocations;
    const split = splitProRata(
      fee,
      weights.map((a) => a.amount)
    );
    const shares = weights.map((a, i) => ({ scope: a.scope, amount: split[i]! })).filter((a) => a.amount > 0n);
    const needed = new Map<string, bigint>();
    for (const share of shares) needed.set(share.scope, (needed.get(share.scope) ?? 0n) + share.amount);
    if (leg.sent.length === 0 && leg.fromAsset.address === NATIVE) {
      // A native first leg's input is still in `eoa` and is debited in the same bracket.
      const inputs = splitProRata(
        quote.inputAmount,
        payload.allocations.map((a) => a.amount)
      );
      payload.allocations.forEach((a, i) => {
        if (needed.has(a.scope)) needed.set(a.scope, needed.get(a.scope)! + inputs[i]!);
      });
    }
    for (const [key, amount] of needed) {
      const [held] = await this.ledger.holdings({
        scope: parseScopeKey(key),
        chainId: leg.fromChainId,
        asset: NATIVE,
        location: "eoa",
      });
      if ((held?.amount ?? 0n) < amount) {
        return {
          shares,
          shortfall:
            `${FEE_SHORTFALL} ${fee} paid on top in the native token of chain ${leg.fromChainId} is not covered: ` +
            `${key} holds ${held?.amount ?? 0n} there, ${amount} needed`,
        };
      }
    }
    return { shares, shortfall: null };
  }

  /** Credits the leg's debited fees paid on top back to the native `eoa` holdings (nothing was signed). */
  private async refundFeesOnTop(id: OperationId, leg: Leg, reason: string): Promise<void> {
    for (const share of leg.feesOnTop ?? []) {
      await this.ledger.credit({
        scope: parseScopeKey(share.scope),
        chainId: leg.fromChainId,
        asset: NATIVE,
        location: "eoa",
        amount: share.amount,
        operationId: id,
        reason,
      });
    }
    leg.feesOnTop = [];
  }

  private async start(intent: TransferIntent): Promise<TransferOutcome> {
    const total = intent.allocations.reduce((acc, a) => acc + a.amount, 0n);
    if (intent.amount <= 0n || total !== intent.amount) {
      return {
        status: "deferred",
        reason: `allocations-mismatch: allocations sum to ${total}, not the amount ${intent.amount}`,
      };
    }
    // The holding check comes before the price check (decisions [L25]): a credit lost in a crash yields
    // `insufficient-holding:` (bounded by the loops) even while prices are unavailable.
    for (const allocation of intent.allocations) {
      const [holding] = await this.ledger.holdings({
        scope: allocation.scope,
        chainId: intent.fromChainId,
        asset: intent.fromAsset.address,
        location: "eoa",
      });
      if ((holding?.amount ?? 0n) < allocation.amount) {
        return {
          status: "deferred",
          reason:
            `insufficient-holding: ${scopeKey(allocation.scope)} holds ${holding?.amount ?? 0n} on chain ` +
            `${intent.fromChainId}, under ${allocation.amount}`,
        };
      }
    }
    const { config, priceOracle } = this.deps;
    const baseline = await computeBaseline(
      priceOracle,
      config.priceSymbols,
      { amount: intent.amount, symbol: intent.fromAsset.symbol, decimals: intent.fromAsset.decimals },
      intent.toAsset
    );
    if (baseline.kind === "unavailable") return { status: "deferred", reason: `price-unavailable: ${baseline.reason}` };
    const payload: TransferPayload = {
      tag: intent.tag,
      fromChainId: intent.fromChainId,
      fromAsset: { ...intent.fromAsset },
      amount: intent.amount,
      toChainId: intent.toChainId,
      toAsset: { ...intent.toAsset },
      allocations: intent.allocations.map((a) => ({ scope: scopeKey(a.scope), amount: a.amount })),
      purpose: intent.purpose,
      baseline: baseline.amount,
      minimumAcceptable: minimumAcceptableOutput(baseline.amount, config.maxLossBps),
      maxLossBps: config.maxLossBps,
    };
    const leg = this.firstLeg(payload);
    const quoted = await this.quoteLeg(payload, leg);
    if (quoted.kind === "no-route") return { status: "deferred", reason: `no-route: ${quoted.reason}` };
    if (quoted.kind === "rejected") return { status: "deferred", reason: `policy-rejected: ${quoted.reason}` };
    const child = await this.ports.journal.createOperation({
      kind: "transfer",
      description:
        `transfer ${intent.amount} ${intent.fromAsset.symbol}@${intent.fromChainId} -> ` +
        `${intent.toAsset.symbol}@${intent.toChainId}`,
      scopes: intent.allocations.map((a) => ({ ...a.scope })),
      parentId: intent.parentOperationId,
      payload: json(payload),
    });
    leg.quote = storeQuote(quoted.quote, this.ports.clock.now());
    const state = this.initialState(leg);
    // An unreadable allowance goes to `approve`, which reads it again before submitting anything.
    const step = (await this.needsApproval(leg).catch(() => true)) ? "approve" : "send";
    await this.save(child.id, step, state);
    return { status: "in-progress", operationId: child.id, step };
  }

  private firstLeg(payload: TransferPayload): Leg {
    return {
      fromChainId: payload.fromChainId,
      fromAsset: payload.fromAsset,
      amount: payload.amount,
      sent: [],
      quote: null,
      priorFees: 0n,
    };
  }

  private initialState(leg: Leg): StepState {
    return {
      legs: [leg],
      attempt: 0,
      approvedSpender: null,
      sendHash: null,
      sentAt: null,
      lastPollAt: null,
      destBalanceBefore: null,
      baselines: [],
      creditCheck: null,
      received: null,
      receivedAsset: null,
      receivingTxHash: null,
      txHashes: [],
      timeoutWarned: false,
      outcome: null,
    };
  }

  /**
   * A later leg continues the operation's bridge-then-swap (decisions [L43]): its policy check uses the first leg's
   * source asset, limit entry and input, and it adds no daily spend.
   */
  private continuationOf(payload: TransferPayload, state: StepState): Continuation | undefined {
    if (state.legs.length < 2) return undefined;
    const first = state.legs[0]!;
    return {
      chainId: first.fromChainId,
      asset: first.fromAsset,
      amount: first.quote?.inputAmount ?? payload.amount,
      // The continuation input must be what the bridge declared it delivers (decisions [L50]).
      bridgeOutput: first.quote?.bridgeOutput?.address ?? null,
    };
  }

  /**
   * The current policy re-applied to the leg's persisted, unsigned quote before its approval and its send (decisions
   * [L44]); null when it still passes or when the provider has no policy of its own. A rejection sends the leg back
   * to `requote`, whose fresh quote goes through the provider's policy again.
   */
  private async recheck(
    id: OperationId,
    payload: TransferPayload,
    state: StepState,
    leg: Leg
  ): Promise<TransferOutcome | null> {
    const violations = this.recheckViolations(payload, state, leg);
    if (violations.length === 0) return null;
    if (state.legs.length > 1) return this.continuationBlocked(id, payload, state, leg, violations.join("; "));
    await this.save(id, "requote", state);
    return { status: "in-progress", operationId: id, step: `policy-rejected: ${violations.join("; ")}` };
  }

  /**
   * A continuation leg the policy blocked, for which LI.FI has no route (`no-route`), whose quote request failed
   * (`failed`: a LI.FI error or timeout, or a ledger read error while quoting) or whose fee paid on top the scopes'
   * native holdings cannot cover (`fee`) (decisions [L64]): its input is the intermediate this operation delivered,
   * booked `in-transit` on the destination chain, and it holds its inbound slot. Until `continuationBlockedMaxTicks`
   * blocked ticks or `statusTimeoutSeconds` after the first one (every cause shares the counter; a failed request is
   * no evidence of a missing route, so it counts toward the time only), it warns (dedup per operation) and goes back to
   * `requote`; then the booking moves to the `eoa` holding of that asset on that chain, the transfer goes to
   * `attention` and one `critical` names the operator action. Nothing stays booked in transit once in `attention`.
   */
  private async continuationBlocked(
    id: OperationId,
    payload: TransferPayload,
    state: StepState,
    leg: Leg,
    reason: string,
    cause: "policy" | "no-route" | "failed" | "fee" = reason.startsWith(FEE_SHORTFALL) ? "fee" : "policy"
  ): Promise<TransferOutcome> {
    const { config } = this.deps;
    const now = this.ports.clock.now();
    const blocked = state.continuationBlocked ?? { since: now.toISOString(), count: 0 };
    if (cause !== "failed") blocked.count += 1;
    state.continuationBlocked = blocked;
    const asset = `${leg.fromAsset.symbol} (${leg.fromAsset.address})`;
    const age = now.getTime() - new Date(blocked.since).getTime();
    const noRoute = cause === "no-route" || cause === "failed";
    const by = {
      policy: "by the policy",
      "no-route": "for lack of a LI.FI route",
      failed: "by failing LI.FI quote requests",
      fee: "for lack of native to pay its LI.FI fee",
    }[cause];
    if (blocked.count < config.continuationBlockedMaxTicks && age < config.statusTimeoutSeconds * 1000) {
      await this.save(id, "requote", state);
      if (noRoute) {
        const what =
          cause === "failed"
            ? `the LI.FI quote request for the swap of ${leg.amount} ${asset} on chain ${leg.fromChainId} failed`
            : `LI.FI has no route for the swap of ${leg.amount} ${asset} on chain ${leg.fromChainId}`;
        await this.ports.notifier.notify({
          severity: "warning",
          title: "LI.FI continuation swap has no route",
          body:
            `Transfer ${id}: ${what} to ${payload.toAsset.symbol} (${reason}); requoted on the next tick ` +
            `(${blocked.count} blocked).`,
          dedupKey: `transfer-continuation-no-route:${id}`,
          operationId: id,
          chainId: leg.fromChainId,
          action:
            `Run lifi-probe for this swap; after ${config.continuationBlockedMaxTicks} blocked ticks or ` +
            `${config.statusTimeoutSeconds} s the token is left in the EOA and the transfer goes to attention ` +
            "(a failed quote request counts toward the time only).",
        });
        return { status: "in-progress", operationId: id, step: `awaiting-route: ${reason}` };
      }
      if (cause === "fee") {
        await this.ports.notifier.notify({
          severity: "warning",
          title: "LI.FI continuation swap cannot pay its fee",
          body:
            `Transfer ${id}: the swap of ${leg.amount} ${asset} on chain ${leg.fromChainId} to ` +
            `${payload.toAsset.symbol} carries a LI.FI fee paid on top that the scope's native holding does not ` +
            `cover (${reason}); requoted on the next tick (${blocked.count} blocked).`,
          dedupKey: `transfer-continuation-fee:${id}`,
          operationId: id,
          chainId: leg.fromChainId,
          action:
            `Fund the scope's native eoa holding on chain ${leg.fromChainId} with the amount named; after ` +
            `${config.continuationBlockedMaxTicks} blocked ticks or ${config.statusTimeoutSeconds} s the token is ` +
            "left in the EOA and the transfer goes to attention.",
        });
        return { status: "in-progress", operationId: id, step: `policy-rejected: ${reason}` };
      }
      await this.ports.notifier.notify({
        severity: "warning",
        title: "LI.FI continuation swap blocked by the policy",
        body:
          `Transfer ${id}: the swap of ${leg.amount} ${asset} on chain ${leg.fromChainId} to ` +
          `${payload.toAsset.symbol} is blocked (${reason}); requoted on the next tick (${blocked.count} blocked).`,
        dedupKey: `transfer-continuation-blocked:${id}`,
        operationId: id,
        chainId: leg.fromChainId,
        action:
          `Add ${leg.fromAsset.address} on chain ${leg.fromChainId} to lifi.allowedAssets if you accept it; after ` +
          `${config.continuationBlockedMaxTicks} blocked ticks the transfer goes to attention.`,
      });
      return { status: "in-progress", operationId: id, step: `policy-rejected: ${reason}` };
    }
    await this.save(id, "release:crediting", state);
    await this.returnToEoa(id, leg, `continuation blocked ${by}`);
    leg.sent = [];
    const why =
      cause === "failed"
        ? `continuation blocked ${by} for ${Math.floor(age / 1000)} s`
        : `continuation blocked ${by} after ${blocked.count} ticks`;
    state.released = { why, reason };
    await this.save(id, "release", state);
    return this.released(id, payload, state, leg);
  }

  /**
   * Step `release`: the continuation was abandoned and its intermediate is already in the `eoa` holding. The transfer
   * goes to `attention` with one `critical`; a resume here (after a crash before that write, or an operator reopening
   * it) raises the same again and never requotes, since nothing is booked in transit any more.
   */
  private async released(
    id: OperationId,
    payload: TransferPayload,
    state: StepState,
    leg: Leg
  ): Promise<TransferOutcome> {
    const asset = `${leg.fromAsset.symbol} (${leg.fromAsset.address})`;
    const { why, reason } = state.released ?? { why: "continuation abandoned", reason: "no reason recorded" };
    const outcome = await this.attention(
      id,
      `${why} (${reason}); ${leg.amount} ${asset} moved to the eoa holding on chain ${leg.fromChainId}`
    );
    await this.ports.notifier.notify({
      severity: "critical",
      title: "LI.FI continuation swap abandoned: intermediate token left in the EOA",
      body:
        `Transfer ${id}: ${leg.amount} ${asset} delivered on chain ${leg.fromChainId} could not be swapped to ` +
        `${payload.toAsset.symbol} (${reason}). It is booked in the eoa holding of the operation's scope on that ` +
        "chain; the operation is in attention.",
      dedupKey: `transfer-continuation-abandoned:${id}`,
      operationId: id,
      chainId: leg.fromChainId,
      action:
        `Swap ${asset} on chain ${leg.fromChainId} to ${payload.toAsset.symbol} by hand. Resuming this operation ` +
        "does not swap it.",
    });
    return outcome;
  }

  /** The current policy's violations of the leg's persisted quote, the daily limit excepted (checked at send). */
  private recheckViolations(payload: TransferPayload, state: StepState, leg: Leg): string[] {
    if (!leg.quote) return [];
    const continuationOf = this.continuationOf(payload, state);
    return this.routeProvider.recheck(
      this.request(payload, leg),
      quoteOf(leg.quote, leg, payload.toChainId),
      continuationOf ? { continuationOf } : {}
    );
  }

  /**
   * Reads the on-chain `allowance` of the quote's spender (decisions [L35]) instead of remembering an earlier
   * approval: approval is needed when it is under the bounded amount. Throws when the chain cannot be read.
   */
  private async needsApproval(leg: Leg): Promise<boolean> {
    const approve = leg.quote?.steps.find((s) => s.kind === "approve");
    if (!approve) return false;
    if (!approve.spender || approve.approvalAmount === null) return true;
    const chain = this.ports.chains.get(approve.chainId);
    if (!chain) throw new Error(`no chain client for ${approve.chainId}`);
    const allowance = await chain.readContract<bigint>({
      address: approve.target,
      abi: erc20Abi,
      functionName: "allowance",
      args: [this.ports.signer, approve.spender],
    });
    return allowance < approve.approvalAmount;
  }

  private save(id: OperationId, step: string, state: StepState) {
    return this.ports.journal.updateOperation(id, { step, stepPayload: json(state) });
  }

  private key(id: OperationId, name: string, attempt: number): string {
    return `op:${id}:step:${name}${attempt > 0 ? `:${attempt}` : ""}`;
  }

  private async attention(id: OperationId, reason: string): Promise<TransferOutcome> {
    await this.ports.journal.updateOperation(id, { status: "attention", lastError: reason });
    return { status: "attention", operationId: id, reason };
  }

  private async advance(child: Operation, payload: TransferPayload): Promise<TransferOutcome> {
    const id = child.id;
    if (child.step.endsWith(":debiting") || child.step.endsWith(":crediting")) {
      return this.attention(
        id,
        `resumed inside the ledger bracket "${child.step}": the amount may be untracked; reconcile the holdings by hand`
      );
    }
    const state = (child.stepPayload as unknown as StepState | null) ?? this.initialState(this.firstLeg(payload));
    const leg = state.legs[state.legs.length - 1]!;
    switch (child.step) {
      case "created":
      case "requote":
        return this.requote(id, payload, state, leg);
      case "approve":
        return this.approve(id, payload, state, leg);
      case "send":
        return this.send(id, payload, state, leg);
      case "send:submit":
        return this.resumeSubmit(id, payload, state, leg);
      case "bridging":
        return this.poll(id, payload, state, leg);
      case "unwrap":
        return this.unwrap(id, payload, state, leg);
      case "release":
        return this.released(id, payload, state, leg);
      default:
        return this.attention(id, `unknown transfer step "${child.step}"`);
    }
  }

  private async requote(
    id: OperationId,
    payload: TransferPayload,
    state: StepState,
    leg: Leg
  ): Promise<TransferOutcome> {
    const quoted = await this.quoteLeg(payload, leg, this.continuationOf(payload, state)).catch((error: unknown) => ({
      kind: "failed" as const,
      reason: `quote failed: ${messageOf(error)}`,
    }));
    if (quoted.kind === "no-route" || quoted.kind === "failed") {
      // A continuation's input sits in transit on the destination chain and holds its inbound slot: bounded ([L64]).
      if (state.legs.length > 1) return this.continuationBlocked(id, payload, state, leg, quoted.reason, quoted.kind);
      return { status: "in-progress", operationId: id, step: `awaiting-route: ${quoted.reason}` };
    }
    if (quoted.kind === "rejected") {
      if (state.legs.length > 1) return this.continuationBlocked(id, payload, state, leg, quoted.reason);
      return { status: "in-progress", operationId: id, step: `policy-rejected: ${quoted.reason}` };
    }
    leg.quote = storeQuote(quoted.quote, this.ports.clock.now());
    const step = (await this.needsApproval(leg).catch(() => true)) ? "approve" : "send";
    await this.save(id, step, state);
    return { status: "in-progress", operationId: id, step };
  }

  private async approve(
    id: OperationId,
    payload: TransferPayload,
    state: StepState,
    leg: Leg
  ): Promise<TransferOutcome> {
    const step = leg.quote?.steps.find((s) => s.kind === "approve");
    if (!leg.quote || !step?.spender) return this.attention(id, "approve step without a spender");
    if (!(await this.needsApproval(leg))) {
      // The allowance already covers the input (an earlier approval of the same spender): nothing to sign.
      await this.save(id, "send", state);
      return { status: "in-progress", operationId: id, step: "send" };
    }
    const legIndex = state.legs.length - 1;
    const name = `approve-${legIndex}-${leg.quote.id}`;
    // Older payloads numbered the approval with the shared counter.
    state.approveAttempt ??= state.attempt;
    const prior = await this.ports.journal.getTransaction(this.key(id, name, state.approveAttempt));
    if (prior?.status === "confirmed") {
      // Approved under this key already, yet the allowance is short again (another send of the same token and
      // spender used it): a new approval under the next attempt's key, never a replay of the recorded one.
      state.approveAttempt += 1;
      await this.save(id, "approve", state);
    }
    if (!prior || prior.status === "confirmed") {
      // Nothing signed under this (possibly new) key yet: the current policy must still approve the quote (decisions
      // [L44]); a re-approval is rechecked too, so a revoked spender or target blocks it (decisions [L67]).
      const rejected = await this.recheck(id, payload, state, leg);
      if (rejected) return rejected;
    }
    const outcome = await this.ports.executor.submit(txOf(step), {
      idempotencyKey: this.key(id, name, state.approveAttempt),
      operationId: id,
    });
    switch (outcome.status) {
      case "confirmed":
        // The send's own counter is left alone (decisions [L44]).
        state.approvedSpender = step.spender;
        state.txHashes.push(outcome.hash);
        await this.save(id, "send", state);
        return { status: "in-progress", operationId: id, step: "send" };
      case "pending":
        return { status: "in-progress", operationId: id, step: "approve" };
      case "failed":
        state.approveAttempt += 1;
        await this.save(id, "approve", state);
        return { status: "in-progress", operationId: id, step: `approve failed, retrying: ${outcome.error}` };
      default:
        return this.attention(id, `approval ${this.describe(outcome)}`);
    }
  }

  private describe(outcome: SubmitOutcome): string {
    switch (outcome.status) {
      case "reverted":
        return `reverted (${outcome.reason ?? "no reason"})`;
      case "replaced":
        return `replaced by ${outcome.replacedByHash ?? "an unknown transaction"}`;
      case "unknown":
        return `in an unknown state (${outcome.detail})`;
      default:
        return outcome.status;
    }
  }

  private quoteIsStale(quote: StoredQuote): boolean {
    const age = this.ports.clock.now().getTime() - new Date(quote.quotedAt).getTime();
    return age > this.deps.config.quoteMaxAgeSeconds * 1000;
  }

  private destinationBalance(payload: TransferPayload): Promise<bigint | null> {
    return this.balanceOf(payload.toChainId, payload.toAsset.address);
  }

  private async balanceOf(chainId: ChainId, asset: string): Promise<bigint | null> {
    const chain = this.ports.chains.get(chainId);
    if (!chain) return null;
    try {
      return asset === NATIVE
        ? await chain.getNativeBalance(this.ports.signer)
        : await chain.getErc20Balance(asset as Address, this.ports.signer);
    } catch {
      return null;
    }
  }

  /**
   * The destination balance of every asset the credit gate may check, read at send: the planned asset, the wrapped
   * native of a native destination (or of a quote that delivers it wrapped), and the bridge step's own output token
   * (an intermediate delivery).
   */
  private async baselinesAt(payload: TransferPayload, quote: StoredQuote): Promise<Baseline[]> {
    const assets = new Set<string>([assetKey(payload.toAsset.address)]);
    const wrapped = this.wrappedNative(payload.toChainId);
    // Every native-destination leg, whatever its quote says (decisions [L54]): an unexpected wrapped delivery is then
    // verified against its own baseline and unwrapped instead of ending in `attention`.
    if ((payload.toAsset.address === NATIVE || quote.deliversWrapped) && wrapped) assets.add(assetKey(wrapped));
    if (quote.bridgeOutput) assets.add(assetKey(quote.bridgeOutput.address));
    const baselines: Baseline[] = [];
    for (const asset of assets) baselines.push({ asset, amount: await this.balanceOf(payload.toChainId, asset) });
    return baselines;
  }

  /** Whether an open transfer holds the inbound slot of its planned (destination chain, asset): sent, not settled. */
  private holdsSlot(op: Operation): boolean {
    const state = op.stepPayload as unknown as StepState | null;
    if (!state) return false;
    const unsent = state.legs.length === 1 && (state.legs[0]?.sent.length ?? 0) === 0;
    return !(unsent && ["created", "requote", "approve", "send"].includes(op.step));
  }

  /**
   * The open transfer that holds this one's inbound slot (decisions [L39]): same planned destination chain and asset,
   * sent and not yet completed (its unwrap included) or in `attention`. Null when the slot is free.
   */
  private async inboundBlocker(id: OperationId, payload: TransferPayload, state: StepState): Promise<Operation | null> {
    const mine = this.deliveryAssets(payload, state);
    const open = await this.ports.journal.listOperations({ kind: "transfer", status: "open" });
    for (const op of open) {
      if (op.id === id) continue;
      const other = op.payload as unknown as TransferPayload | null;
      if (!other || other.toChainId !== payload.toChainId) continue;
      const theirs = this.deliveryAssets(other, op.stepPayload as unknown as StepState | null);
      if (![...theirs].some((asset) => mine.has(asset))) continue;
      if (this.holdsSlot(op)) return op;
    }
    return null;
  }

  /**
   * Every asset a transfer's delivery can leave on its destination chain (decisions [L44]): the planned asset, the
   * wrapped native of a native delivery, each leg's bridge output (an intermediate) and every baseline it recorded.
   */
  private deliveryAssets(payload: TransferPayload, state: StepState | null): Set<string> {
    const assets = new Set<string>([assetKey(payload.toAsset.address)]);
    const wrapped = this.wrappedNative(payload.toChainId);
    if (payload.toAsset.address === NATIVE && wrapped) assets.add(assetKey(wrapped));
    for (const leg of state?.legs ?? []) {
      if (leg.quote?.bridgeOutput) assets.add(assetKey(leg.quote.bridgeOutput.address));
      if (leg.quote?.deliversWrapped && wrapped) assets.add(assetKey(wrapped));
    }
    for (const baseline of state?.baselines ?? []) assets.add(baseline.asset);
    return assets;
  }

  private async send(id: OperationId, payload: TransferPayload, state: StepState, leg: Leg): Promise<TransferOutcome> {
    const first = state.legs.length === 1 && leg.sent.length === 0;
    if (first) {
      const blocker = await this.inboundBlocker(id, payload, state);
      if (blocker && state.slotWarnedFor !== blocker.id) {
        state.slotWarnedFor = blocker.id;
        await this.save(id, "send", state);
        await this.ports.notifier.notify({
          severity: "warning",
          title: "LI.FI transfer waiting for an inbound slot",
          body:
            `Transfer ${id} to ${payload.toAsset.symbol}@${payload.toChainId} waits for transfer ${blocker.id} ` +
            `(step ${blocker.step}) to complete or reach attention: one inbound leg per destination chain and asset, ` +
            `so each credit is verified against its own balance window.`,
          dedupKey: `transfer-slot-wait:${id}`,
          operationId: id,
          chainId: payload.toChainId,
          action:
            `If transfer ${blocker.id} is stuck, resolve it (it times out to attention on its own); this one then ` +
            "proceeds.",
        });
      }
      if (blocker) return { status: "in-progress", operationId: id, step: `awaiting-inbound-slot: ${blocker.id}` };
    }
    if (!leg.quote || this.quoteIsStale(leg.quote)) return this.requote(id, payload, state, leg);
    if (await this.needsApproval(leg)) {
      await this.save(id, "approve", state);
      return { status: "in-progress", operationId: id, step: "approve" };
    }
    const rejected = await this.recheck(id, payload, state, leg);
    if (rejected) return rejected;
    // A continuation leg adds no daily spend: its parent leg counted the operation once (decisions [L43]).
    const parentLeg = state.legs.length === 1;
    const overLimit = parentLeg ? await this.dailyLimitViolation(leg, leg.quote) : null;
    if (overLimit) return { status: "in-progress", operationId: id, step: `policy-rejected: ${overLimit}` };
    // The fee paid on top is re-checked against the holdings now; its shares are computed once for the debit below.
    const fees = await this.feesOnTop(payload, leg, leg.quote);
    if (fees.shortfall) {
      if (state.legs.length > 1) return this.continuationBlocked(id, payload, state, leg, fees.shortfall);
      await this.save(id, "requote", state);
      return { status: "in-progress", operationId: id, step: `policy-rejected: ${fees.shortfall}` };
    }
    await this.save(id, "send:debiting", state);
    // Every leg records the balances its own delivery is checked against (a WETH delivery of a continuation swap is
    // measured from that swap's send, not from the first bridge's).
    state.baselines = await this.baselinesAt(payload, leg.quote);
    if (state.legs.length === 1 && leg.sent.length === 0) {
      // The quote's input may be a little under the intent (LI.FI unit granularity); the dust stays in `eoa`.
      const amounts = splitProRata(
        leg.quote.inputAmount,
        payload.allocations.map((a) => a.amount)
      );
      state.destBalanceBefore = await this.destinationBalance(payload);
      leg.sent = payload.allocations.map((a, i) => ({ scope: a.scope, amount: amounts[i]! }));
      for (const allocation of leg.sent) {
        if (allocation.amount <= 0n) continue;
        const entry = {
          scope: parseScopeKey(allocation.scope),
          chainId: leg.fromChainId,
          asset: leg.fromAsset.address,
          amount: allocation.amount,
          operationId: id,
        };
        await this.ledger.debit({ ...entry, location: "eoa", reason: "transfer sent" });
        await this.ledger.credit({ ...entry, location: "in-transit", reason: "transfer sent" });
      }
    }
    for (const share of fees.shares) {
      await this.ledger.debit({
        scope: parseScopeKey(share.scope),
        chainId: leg.fromChainId,
        asset: NATIVE,
        location: "eoa",
        amount: share.amount,
        operationId: id,
        reason: "transfer fee paid on top",
      });
    }
    // Always set ([] included): it marks a bracket written by this version (see `resumeSubmit`).
    leg.feesOnTop = fees.shares;
    if (parentLeg && !this.spendReserved(leg)) {
      // Inside the bracket and before the submit: the next send (of any operation) sees it in the daily limit, and a
      // crash before the marker below is `attention`, never a second row. A send that later fails before signing
      // keeps its row (the limit over-counts, never under-counts) and its retry adds none.
      await this.ledger.recordSpend({
        chainId: leg.fromChainId,
        asset: leg.fromAsset.address,
        category: "transfer",
        amount: leg.quote.inputAmount,
        operationId: id,
        at: this.ports.clock.now(),
      });
      leg.spendRecorded = true;
      leg.spendRecordedAt = this.ports.clock.now().toISOString();
    }
    await this.save(id, "send:submit", state);
    return this.submitSend(id, payload, state, leg);
  }

  /** The leg's spend row exists and is still inside the rolling 24 hours (it reserves the leg's input). */
  private spendReserved(leg: Leg): boolean {
    if (!leg.spendRecorded) return false;
    // A row written before `spendRecordedAt` existed has no age: it is treated as reserved (the earlier behaviour).
    if (!leg.spendRecordedAt) return true;
    return this.ports.clock.now().getTime() - new Date(leg.spendRecordedAt).getTime() < DAY_MS;
  }

  /**
   * The daily limit re-checked when a (possibly cached) quote is sent, against the spends recorded so far (sends of
   * other operations included); null when the send may go. Every unsigned leg is checked: one whose own row is still
   * in the window is already counted in `spent`; one whose row aged out (a retry a day later) adds its input again
   * and gets a fresh row.
   */
  private async dailyLimitViolation(leg: Leg, quote: StoredQuote): Promise<string | null> {
    const limit = findLimit(this.deps.config, leg.fromChainId, leg.fromAsset.address);
    // No limit configured: the quote-time policy rejects that (`limit:`); the route provider owns the rejection.
    if (!limit) return null;
    const daily = parseUnits(limit.daily, limit.decimals);
    const spent = await this.ledger.spentSince({
      since: new Date(this.ports.clock.now().getTime() - DAY_MS),
      chainId: leg.fromChainId,
      asset: leg.fromAsset.address,
      category: "transfer",
    });
    const adding = this.spendReserved(leg) ? 0n : quote.inputAmount;
    if (spent + adding <= daily) return null;
    return `daily-limit: ${spent} spent in 24h plus ${adding} exceeds ${daily} (checked at send)`;
  }

  /**
   * A resume at `send:submit`. A transaction recorded under the key is always resolved under it, never requoted.
   * When none was recorded (a crash between the bracket and the submit) nothing is signed yet, so the full current
   * policy decides again before signing (decisions [L51]): the quote's age (the facet data carries a deadline), the
   * policy's re-evaluation and the daily limit. A leg it blocks is moved back (`in-transit` to `eoa`) and requoted
   * under a new attempt key; it keeps its one `transfer` spend row, which the requote reuses (`spendReserved`,
   * decisions [L58]), so `spentSince` does not grow and no row is ever negative.
   */
  private async resumeSubmit(
    id: OperationId,
    payload: TransferPayload,
    state: StepState,
    leg: Leg
  ): Promise<TransferOutcome> {
    const record = await this.ports.journal.getTransaction(
      this.key(id, `send-${state.legs.length - 1}`, state.attempt)
    );
    if (record || !leg.quote) return this.submitSend(id, payload, state, leg);
    // A bracket an older version wrote debited no fee paid on top: nothing is signed, so it is moved back and resent.
    const legacyFees = leg.feesOnTop === undefined && feeOnTop(leg.quote, leg.fromAsset) > 0n;
    if (legacyFees || this.quoteIsStale(leg.quote)) return this.moveBack(id, payload, state, leg, null);
    const violations = this.recheckViolations(payload, state, leg);
    if (state.legs.length === 1) {
      const overLimit = await this.dailyLimitViolation(leg, leg.quote);
      if (overLimit) violations.push(overLimit);
    }
    if (violations.length > 0) return this.moveBack(id, payload, state, leg, violations.join("; "));
    return this.submitSend(id, payload, state, leg);
  }

  /**
   * An unsigned leg goes back to `requote` under the next attempt key. The first leg's bracket is undone (`in-transit`
   * back to `eoa`, inside a `send:crediting` marker), so the money is never booked in transit while nothing is sent;
   * a continuation leg's input is the intermediate this operation delivered and stays in transit for its requote.
   * `rejected` is the policy's verdict, null for an expired quote.
   */
  private async moveBack(
    id: OperationId,
    payload: TransferPayload,
    state: StepState,
    leg: Leg,
    rejected: string | null
  ): Promise<TransferOutcome> {
    const booked = state.legs.length === 1 && leg.sent.length > 0;
    if (booked || leg.feesOnTop?.length) {
      await this.save(id, "send:crediting", state);
      if (booked) {
        await this.returnToEoa(id, leg, "transfer blocked before signing");
        leg.sent = [];
      }
      await this.refundFeesOnTop(id, leg, "transfer blocked before signing");
    }
    state.attempt += 1;
    await this.save(id, "requote", state);
    if (rejected !== null && state.legs.length > 1) return this.continuationBlocked(id, payload, state, leg, rejected);
    if (rejected !== null) return { status: "in-progress", operationId: id, step: `policy-rejected: ${rejected}` };
    return this.requote(id, payload, state, leg);
  }

  /** Moves the leg's `in-transit` allocations back to the source `eoa` holdings. */
  private async returnToEoa(id: OperationId, leg: Leg, reason: string): Promise<void> {
    for (const allocation of leg.sent) {
      if (allocation.amount <= 0n) continue;
      const entry = {
        scope: parseScopeKey(allocation.scope),
        chainId: leg.fromChainId,
        asset: leg.fromAsset.address,
        amount: allocation.amount,
        operationId: id,
      };
      await this.ledger.debit({ ...entry, location: "in-transit", reason });
      await this.ledger.credit({ ...entry, location: "eoa", reason });
    }
  }

  private async submitSend(
    id: OperationId,
    payload: TransferPayload,
    state: StepState,
    leg: Leg
  ): Promise<TransferOutcome> {
    const step = leg.quote?.steps.find((s) => s.kind !== "approve");
    if (!leg.quote || !step) return this.attention(id, "send step without a quoted transaction");
    const legIndex = state.legs.length - 1;
    const sendKey = this.key(id, `send-${legIndex}`, state.attempt);
    const outcome = await this.ports.executor.submit(txOf(step), { idempotencyKey: sendKey, operationId: id });
    const now = this.ports.clock.now();
    switch (outcome.status) {
      case "confirmed": {
        state.sendHash = outcome.hash;
        state.sentAt = now.toISOString();
        state.lastPollAt = null;
        state.attempt = 0;
        state.txHashes.push(outcome.hash);
        await this.save(id, "bridging", state);
        await this.ports.journal.recordObservation(
          `in-transit:${id}`,
          json({
            state: "in-transit",
            fromChainId: leg.fromChainId,
            toChainId: payload.toChainId,
            asset: leg.fromAsset.symbol,
            amount: leg.quote.inputAmount,
            tool: leg.quote.tool,
            txHash: outcome.hash,
            sentAt: state.sentAt,
          }),
          now
        );
        return { status: "in-progress", operationId: id, step: "bridging" };
      }
      case "pending":
        return { status: "in-progress", operationId: id, step: "send:submit" };
      case "failed": {
        // Never signed: move the funds back from in-transit, retry under a new key on a later run. Defensive: only
        // when the journal agrees that no signed transaction exists under the key.
        const record = await this.ports.journal.getTransaction(sendKey);
        if (!neverSigned(record)) {
          return this.attention(
            id,
            `bridge submit returned failed but the record under ${sendKey} is ` +
              `${record ? `${record.status} with a signed transaction` : "missing"}; the funds stay in transit`
          );
        }
        const first = state.legs.length === 1;
        if (first || leg.feesOnTop?.length) {
          await this.save(id, "send:crediting", state);
          if (first) {
            await this.returnToEoa(id, leg, "transfer send failed");
            leg.sent = [];
          }
          await this.refundFeesOnTop(id, leg, "transfer send failed");
        }
        state.attempt += 1;
        await this.save(id, "send", state);
        return { status: "in-progress", operationId: id, step: `send failed, retrying: ${outcome.error}` };
      }
      default:
        return this.attention(id, `bridge transaction ${this.describe(outcome)}`);
    }
  }

  private async poll(id: OperationId, payload: TransferPayload, state: StepState, leg: Leg): Promise<TransferOutcome> {
    const { config } = this.deps;
    const now = this.ports.clock.now();
    if (!state.sendHash || !state.sentAt || !leg.quote) return this.attention(id, "bridging without a recorded send");
    if (state.lastPollAt && now.getTime() - new Date(state.lastPollAt).getTime() < config.pollIntervalSeconds * 1000) {
      return { status: "in-progress", operationId: id, step: "bridging" };
    }
    const timedOut = now.getTime() - new Date(state.sentAt).getTime() > config.statusTimeoutSeconds * 1000;
    const status = await this.deps.routeProvider.status({
      tool: leg.quote.tool,
      txHash: state.sendHash,
      fromChainId: leg.fromChainId,
      toChainId: payload.toChainId,
    });
    state.lastPollAt = now.toISOString();
    switch (status.state) {
      case "pending":
        if (timedOut && !state.timeoutWarned) {
          state.timeoutWarned = true;
          await this.ports.notifier.notify({
            severity: "warning",
            title: "LI.FI transfer still pending past its timeout",
            body:
              `Transfer ${id} (${leg.quote.tool}) sent at ${state.sentAt} is still pending. No second bridge ` +
              `is started.`,
            dedupKey: `transfer-timeout:${id}`,
            operationId: id,
            chainId: leg.fromChainId,
            txHashes: [state.sendHash],
            action: "Check the transfer on scan.li.fi and the bridge's explorer; the bot keeps polling.",
          });
        }
        await this.save(id, "bridging", state);
        return { status: "in-progress", operationId: id, step: "bridging" };
      case "unknown": {
        // Once LI.FI has reported the leg DONE, the bound runs from that report, never from the send (decisions [L67]).
        const expired = state.doneSeenAt
          ? now.getTime() - new Date(state.doneSeenAt).getTime() > config.statusTimeoutSeconds * 1000
          : timedOut;
        if (expired) return this.attention(id, `transfer status unknown past the timeout: ${status.detail}`);
        await this.save(id, "bridging", state);
        return { status: "in-progress", operationId: id, step: "bridging" };
      }
      case "failed":
        return this.attention(id, `LI.FI reports the transfer failed: ${status.reason}`);
      case "done":
        return this.received(id, payload, state, leg, status);
    }
  }

  private async received(
    id: OperationId,
    payload: TransferPayload,
    state: StepState,
    leg: Leg,
    status: { received: bigint; receivedAsset: Asset | null; receivingTxHash: Hex | null }
  ): Promise<TransferOutcome> {
    const now = this.ports.clock.now();
    state.doneSeenAt ??= now.toISOString();
    // Every wait after the first DONE is bounded from that report, never from the send (decisions [L67]).
    const sinceDone = now.getTime() - new Date(state.doneSeenAt).getTime();
    const expired = sinceDone > this.deps.config.statusTimeoutSeconds * 1000;
    const waiting = async (detail: string): Promise<TransferOutcome> => {
      if (expired) return this.attention(id, `${detail} ${sinceDone / 1000} s after LI.FI reported it done`);
      await this.save(id, "bridging", state);
      return { status: "in-progress", operationId: id, step: "bridging" };
    };
    if (!status.receivingTxHash) return waiting("done without a receiving transaction");
    const asset = status.receivedAsset;
    if (!asset || asset.chainId !== payload.toChainId) {
      return this.attention(
        id,
        `unexpected asset delivered: ${asset ? `${asset.symbol}@${asset.chainId}` : "unknown"}`
      );
    }
    const chain = this.ports.chains.get(payload.toChainId);
    if (!chain) return this.attention(id, `no chain client for ${payload.toChainId}`);
    // A failing read keeps the leg in progress; past `statusTimeoutSeconds` from the first DONE (never from the send:
    // a bridge that finished late survives one failing read) it is `attention`, which frees the inbound slot.
    const readFailed = async (error: unknown): Promise<TransferOutcome> => {
      if (expired) {
        return this.attention(
          id,
          `receiving transaction ${status.receivingTxHash} cannot be read ${sinceDone / 1000} s after LI.FI reported ` +
            `it done: ${messageOf(error)}`
        );
      }
      await this.save(id, "bridging", state);
      return { status: "in-progress", operationId: id, step: `bridging: receipt read failed: ${messageOf(error)}` };
    };
    let receipt: TransactionReceiptView | null;
    try {
      receipt = await chain.getTransactionReceipt(status.receivingTxHash);
    } catch (error) {
      return readFailed(error);
    }
    if (!receipt) return waiting("receiving transaction not found yet");
    if (receipt.status !== "success")
      return this.attention(id, `receiving transaction ${status.receivingTxHash} reverted`);
    // Credit only once the receipt is the destination chain's configured confirmations deep (a reorg could drop it).
    const confirmations = BigInt(
      this.ports.config.topology.chains.find((c) => c.id === payload.toChainId)?.confirmations ?? 1
    );
    let head: bigint;
    try {
      head = await chain.getBlockNumber();
    } catch (error) {
      return readFailed(error);
    }
    if (head - receipt.blockNumber + 1n < confirmations) {
      await this.save(id, "bridging", state);
      return { status: "in-progress", operationId: id, step: "bridging" };
    }
    state.receivingTxHash = status.receivingTxHash;
    if (!state.txHashes.includes(status.receivingTxHash)) state.txHashes.push(status.receivingTxHash);

    const wrapped = this.wrappedNative(payload.toChainId);
    const isFinal = sameAsset(asset, payload.toAsset);
    const isWrapped =
      payload.toAsset.address === NATIVE &&
      wrapped !== undefined &&
      asset.address.toLowerCase() === wrapped.toLowerCase();
    if (isFinal || isWrapped) {
      if (status.received < leg.quote!.minimumOutput) {
        return this.attention(
          id,
          `received ${status.received} ${asset.symbol}, under the quoted minimum ${leg.quote!.minimumOutput}`
        );
      }
      // Credit at most what the quote promised (decisions [L23]): an over-reported status never inflates a holding.
      const promised = leg.quote!.estimatedOutput;
      if (status.received > promised) {
        await this.ports.notifier.notify({
          severity: "warning",
          title: "LI.FI reports more than the quote promised",
          body:
            `Transfer ${id} on chain ${payload.toChainId}: LI.FI reports ${status.received} ${asset.symbol} ` +
            `received, the quote estimated ${promised}. The bot credits ${promised}.`,
          dedupKey: `transfer-over-reported:${id}`,
          operationId: id,
          chainId: payload.toChainId,
          txHashes: [status.receivingTxHash],
          action: "Compare the receiving transaction with the quote; an excess stays in the EOA as untracked balance.",
        });
      }
      const credit = status.received > promised ? promised : status.received;
      if (asset.address !== NATIVE) {
        const unverified = await this.verifyIncrease(id, payload, state, asset, credit, status.receivingTxHash);
        if (unverified) return unverified;
      }
      state.received = credit;
      state.receivedAsset = asset;
      state.attempt = 0;
      if (isWrapped) {
        await this.save(id, "unwrap", state);
        return { status: "in-progress", operationId: id, step: "unwrap" };
      }
      return this.complete(id, payload, state, leg);
    }
    // The bridge delivered an intermediate asset (the destination swap did not run): keep it in transit and requote
    // the remaining swap against the original baseline. Never a second bridge.
    if (state.legs.length >= MAX_LEGS) {
      return this.attention(id, `second leg delivered ${asset.symbol} instead of ${payload.toAsset.symbol}`);
    }
    // Capped at the bridge step's own estimate when the quote reported it for this asset; gated like a final ERC20.
    const bridged = leg.quote!.bridgeOutput;
    const cap =
      bridged && bridged.estimate !== null && assetKey(bridged.address) === assetKey(asset.address)
        ? bridged.estimate
        : null;
    const credit = cap !== null && status.received > cap ? cap : status.received;
    if (asset.address !== NATIVE) {
      const unverified = await this.verifyIncrease(id, payload, state, asset, credit, status.receivingTxHash);
      if (unverified) return unverified;
    }
    const amounts = splitProRata(
      credit,
      leg.sent.map((a) => a.amount)
    );
    const next: Leg = {
      fromChainId: payload.toChainId,
      fromAsset: asset,
      amount: credit,
      sent: leg.sent.map((a, i) => ({ scope: a.scope, amount: amounts[i]! })),
      quote: null,
      priorFees: leg.priorFees + leg.quote!.feeCostsInOutput,
    };
    await this.save(id, "leg:crediting", state);
    await this.moveInTransit(id, leg, next);
    state.legs.push(next);
    state.attempt = 0;
    state.approvedSpender = null;
    state.sendHash = null;
    state.lastPollAt = null;
    state.doneSeenAt = null;
    await this.save(id, "requote", state);
    return { status: "in-progress", operationId: id, step: "requote" };
  }

  /**
   * The ERC20 credit gate (decisions [L39]): the token's balance now against its own baseline recorded at send must
   * have risen by at least `amount`. Null when verified; otherwise nothing is credited, a warning is raised once, and
   * after the configured number of checks or age the transfer goes to `attention`.
   */
  private async verifyIncrease(
    id: OperationId,
    payload: TransferPayload,
    state: StepState,
    asset: Asset,
    amount: bigint,
    receivingTxHash: Hex
  ): Promise<TransferOutcome | null> {
    const key = assetKey(asset.address);
    const before = state.baselines?.find((b) => b.asset === key)?.amount ?? null;
    const after = await this.balanceOf(payload.toChainId, asset.address);
    const increase = before !== null && after !== null ? after - before : null;
    if (increase !== null && increase >= amount) {
      state.creditCheck = null;
      return null;
    }
    const { config } = this.deps;
    const now = this.ports.clock.now();
    const check = state.creditCheck ?? { since: now.toISOString(), count: 0 };
    check.count += 1;
    state.creditCheck = check;
    const observed =
      before === null
        ? `no ${asset.symbol} balance was recorded at send`
        : after === null
          ? `the ${asset.symbol} balance cannot be read`
          : `the ${asset.symbol} balance rose by ${increase}`;
    const detail = `LI.FI reports ${amount} ${asset.symbol} delivered but ${observed}; nothing is credited`;
    const age = now.getTime() - new Date(check.since).getTime();
    if (check.count >= config.creditCheckMaxTicks || age >= config.creditCheckMaxAgeSeconds * 1000) {
      return this.attention(id, `unverified delivery: ${detail} (${check.count} checks)`);
    }
    if (check.count === 1)
      await this.ports.notifier.notify({
        severity: "warning",
        title: "LI.FI delivery not visible in the EOA balance",
        body: `Transfer ${id} on chain ${payload.toChainId}: ${detail}. The bot re-checks on its next polls.`,
        dedupKey: `transfer-unverified:${id}`,
        operationId: id,
        chainId: payload.toChainId,
        txHashes: [receivingTxHash],
        action:
          "Compare the receiving transaction with the EOA's token balance; if the funds never arrived, the transfer " +
          "goes to attention after the configured checks.",
      });
    await this.save(id, "bridging", state);
    return { status: "in-progress", operationId: id, step: "bridging: delivery not verified" };
  }

  private wrappedNative(chainId: ChainId): Address | undefined {
    return this.ports.config.topology.chains.find((c) => c.id === chainId)?.wrappedNative;
  }

  private async moveInTransit(id: OperationId, from: Leg, to: Leg): Promise<void> {
    for (const allocation of from.sent) {
      if (allocation.amount <= 0n) continue;
      await this.ledger.debit({
        scope: parseScopeKey(allocation.scope),
        chainId: from.fromChainId,
        asset: from.fromAsset.address,
        location: "in-transit",
        amount: allocation.amount,
        operationId: id,
        reason: "bridge delivered an intermediate asset",
      });
    }
    for (const allocation of to.sent) {
      if (allocation.amount <= 0n) continue;
      await this.ledger.credit({
        scope: parseScopeKey(allocation.scope),
        chainId: to.fromChainId,
        asset: to.fromAsset.address,
        location: "in-transit",
        amount: allocation.amount,
        operationId: id,
        reason: "bridge delivered an intermediate asset",
      });
    }
  }

  private async unwrap(
    id: OperationId,
    payload: TransferPayload,
    state: StepState,
    leg: Leg
  ): Promise<TransferOutcome> {
    const wrapped = this.wrappedNative(payload.toChainId);
    if (!wrapped || state.received === null) return this.attention(id, "unwrap without a wrapped native or an amount");
    const outcome = await this.ports.executor.submit(unwrapTx(payload.toChainId, wrapped, state.received), {
      idempotencyKey: this.key(id, "unwrap", state.attempt),
      operationId: id,
    });
    switch (outcome.status) {
      case "confirmed":
        state.txHashes.push(outcome.hash);
        state.receivedAsset = { ...payload.toAsset };
        return this.complete(id, payload, state, leg);
      case "pending":
        return { status: "in-progress", operationId: id, step: "unwrap" };
      case "failed":
        state.attempt += 1;
        await this.save(id, "unwrap", state);
        return { status: "in-progress", operationId: id, step: `unwrap failed, retrying: ${outcome.error}` };
      default:
        return this.attention(id, `unwrap ${this.describe(outcome)}`);
    }
  }

  private async complete(
    id: OperationId,
    payload: TransferPayload,
    state: StepState,
    leg: Leg
  ): Promise<TransferOutcome> {
    const received = state.received!;
    const now = this.ports.clock.now();
    const shares = splitProRata(
      received,
      payload.allocations.map((a) => a.amount)
    );
    const receivedByScope: TransferAllocation[] = payload.allocations.map((a, i) => ({
      scope: parseScopeKey(a.scope) as AccountingScope,
      amount: shares[i]!,
    }));
    await this.save(id, "receive:crediting", state);
    for (const allocation of leg.sent) {
      if (allocation.amount <= 0n) continue;
      await this.ledger.debit({
        scope: parseScopeKey(allocation.scope),
        chainId: leg.fromChainId,
        asset: leg.fromAsset.address,
        location: "in-transit",
        amount: allocation.amount,
        operationId: id,
        reason: "transfer received",
      });
    }
    for (const share of receivedByScope) {
      if (share.amount <= 0n) continue;
      await this.ledger.credit({
        scope: share.scope,
        chainId: payload.toChainId,
        asset: payload.toAsset.address,
        location: "eoa",
        amount: share.amount,
        operationId: id,
        reason: "transfer received",
      });
    }
    const outcome: TransferOutcome = {
      status: "completed",
      operationId: id,
      received,
      receivedByScope,
      realizedLossBps: lossBps(payload.baseline, received),
      txHashes: [...state.txHashes],
    };
    state.outcome = json(outcome);
    await this.ports.journal.updateOperation(id, { step: "completed", stepPayload: json(state), status: "completed" });
    if (payload.baseline > received) {
      await this.ledger.recordSpend({
        chainId: payload.toChainId,
        asset: payload.toAsset.address,
        category: "slippage",
        amount: payload.baseline - received,
        operationId: id,
        at: now,
      });
    }
    await this.ports.journal.recordObservation(`in-transit:${id}`, json({ state: "received", received }), now);
    await this.recordDelta(id, payload, state, received, now);
    return outcome;
  }

  /** The destination balance delta net of this transfer's own gas there; a short delta only warns. */
  private async recordDelta(id: OperationId, payload: TransferPayload, state: StepState, credited: bigint, now: Date) {
    const before = state.destBalanceBefore;
    const after = await this.destinationBalance(payload);
    if (before === null || after === null) {
      await this.ports.journal.recordObservation(
        `transfer-delta:${id}`,
        json({ credited, delta: null, note: "destination balance unavailable" }),
        now
      );
      return;
    }
    let gas = 0n;
    if (payload.toAsset.address === NATIVE) {
      const chain = this.ports.chains.get(payload.toChainId);
      const records = await this.ports.journal.listTransactions({ operationId: id, chainId: payload.toChainId });
      for (const record of records) {
        if (!record.hash || !chain) continue;
        const receipt = await chain.getTransactionReceipt(record.hash).catch(() => null);
        if (receipt) gas += receipt.gasUsed * receipt.effectiveGasPrice;
      }
    }
    const delta = after - before + gas;
    await this.ports.journal.recordObservation(
      `transfer-delta:${id}`,
      json({ credited, delta, gas, before, after, short: delta < credited }),
      now
    );
    if (delta < credited) {
      await this.ports.notifier.notify({
        severity: "warning",
        title: "Transfer credited more than the balance delta",
        body:
          `Transfer ${id} credited ${credited} (LI.FI's reported amount) on chain ${payload.toChainId}, but the EOA ` +
          `balance moved by ${delta} net of the transfer's own gas. Other activity on the EOA can explain it.`,
        dedupKey: `transfer-delta:${id}`,
        operationId: id,
        chainId: payload.toChainId,
        txHashes: state.txHashes,
        action: "Compare the receiving transaction with the EOA's balance history; reconcile the holdings if short.",
      });
    }
  }
}
