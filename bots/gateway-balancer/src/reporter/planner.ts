import type { AppConfig, ChainConfig, PairConfig, ReporterRoute } from "../config/schema";
import {
  NATIVE,
  assetKey,
  foreignGatewayClaimKey,
  mulDiv,
  sameAsset,
  type AccountingScope,
  type Address,
  type Asset,
} from "../domain";
import type { ForeignGatewayTreasury, Journal, ReporterFunding, RouteProvider } from "../ports";
import { routeThresholds, type RouteThresholds } from "./config";
import type { FundingPayload, FundingState } from "./loop";

/** Message shortfalls are fixed-point with 18 decimals, so routes with different native tokens compare. */
const MESSAGE_SCALE = 10n ** 18n;

export interface RouteContext {
  route: ReporterRoute;
  pair: PairConfig;
  chain: ChainConfig;
  /** The reporter chain's native gas token, the only asset a reporter is funded in. */
  nativeAsset: Asset;
  scope: AccountingScope;
  /** `undefined` when the route has no configured cost per message. */
  thresholds: RouteThresholds | undefined;
}

export function routeContext(config: AppConfig, route: ReporterRoute): RouteContext {
  const pair = config.topology.pairs.find((p) => p.id === route.pairId);
  if (!pair) throw new Error(`route ${route.id}: unknown pair ${route.pairId}`);
  const chain = config.topology.chains.find((c) => c.id === route.chainId);
  if (!chain) throw new Error(`route ${route.id}: unknown chain ${route.chainId}`);
  return {
    route,
    pair,
    chain,
    nativeAsset: { chainId: chain.id, address: NATIVE, symbol: chain.nativeSymbol, decimals: chain.nativeDecimals },
    scope: { kind: "bridging", routeId: route.id },
    thresholds: routeThresholds(config.reporter, route, chain),
  };
}

/** The persisted quote a cross-asset claim was sized from. */
export interface PlannedQuote {
  id: string;
  inputAmount: bigint;
  estimatedOutput: bigint;
}

/** One collected asset of the pair this operation sources from. */
export interface LegPlan {
  /** The pool asset, on the pair's foreign chain. */
  asset: Asset;
  claimKey: string;
  /** Claimed and withdrawn from the ForeignGateway bridging category; 0 when the leg only moves a holding. */
  claimAmount: bigint;
  /** This route's `bridging:<route>` holding of the asset already on the foreign chain (an earlier leftover). */
  holdingAmount: bigint;
  /** The asset must go through `Transfers` (another chain or another token) before funding. */
  transfer: boolean;
  /** Present for a cross-asset leg (pool asset not in the route's native unit). */
  quote: PlannedQuote | null;
  /** Expected route-native output of the leg (1:1 for the same unit, from the quote otherwise). */
  expectedOutput: bigint;
  /**
   * The amount a transferring leg sends: `min(holdingAmount + claimAmount, need-sized input)`, so a large leftover
   * holding is never sent whole for a small need. Absent in operations journaled before run 010, where
   * `needSizedInputs` derives it from the persisted fields.
   */
  transferAmount?: bigint;
}

export type FundingPlan =
  | { kind: "idle"; balance: bigint; thresholds: RouteThresholds }
  | { kind: "deferred"; balance: bigint; thresholds: RouteThresholds; reason: string; short: boolean }
  | { kind: "suspend"; reason: string }
  | {
      kind: "fund";
      balance: bigint;
      thresholds: RouteThresholds;
      /** `target - balance`, in route-native units. */
      need: bigint;
      /** Part of `need` the route's own `bridging:<route>` holding on its chain covers. */
      holdingUsed: bigint;
      legs: LegPlan[];
      /** `holdingUsed` plus the expected output of every leg. */
      expectedTotal: bigint;
      /** The pair's bridging funds cover less than this route's need. */
      partial: boolean;
      /** This route's share of the pair's message shortfalls, scaled by 1e18 (1e18 is the whole pool). */
      shareE18: bigint;
    };

export interface PlannerDeps {
  config: AppConfig;
  journal: Journal;
  funding: ReporterFunding;
  treasury: ForeignGatewayTreasury | undefined;
  routeProvider: RouteProvider;
  signer: Address;
}

export function suspendedObservationKey(routeId: string): string {
  return `suspended:reporter:${routeId}`;
}

export async function localHolding(journal: Journal, ctx: RouteContext): Promise<bigint> {
  const holdings = await journal.ledger.holdings({
    scope: ctx.scope,
    chainId: ctx.route.chainId,
    asset: NATIVE,
    location: "eoa",
  });
  return holdings.reduce((acc, h) => acc + h.amount, 0n);
}

async function holdingOf(journal: Journal, scope: AccountingScope, asset: Asset): Promise<bigint> {
  const holdings = await journal.ledger.holdings({
    scope,
    chainId: asset.chainId,
    asset: asset.address,
    location: "eoa",
  });
  return holdings.reduce((acc, h) => acc + h.amount, 0n);
}

/** True when the pool asset is already the reporter's native token on the reporter's chain. */
export function needsTransfer(ctx: RouteContext, asset: Asset): boolean {
  return !sameAsset(asset, ctx.nativeAsset);
}

/** Same unit as the route's native token (ETH on Base for ETH on Arbitrum): sized 1:1, no quote needed. */
function sameUnit(ctx: RouteContext, asset: Asset): boolean {
  return asset.symbol === ctx.nativeAsset.symbol && asset.decimals === ctx.nativeAsset.decimals;
}

function messagesE18(amount: bigint, thresholds: RouteThresholds): bigint {
  return amount <= 0n ? 0n : mulDiv(amount, MESSAGE_SCALE, thresholds.costPerMessage);
}

/**
 * The message shortfall of every route of the pair that competes for its bridging pool: routes below their
 * low-water, and routes with an open funding operation (their claims are part of the pool the shares are taken
 * from). Suspended routes without an open operation do not compete.
 *
 * A route with an open operation weighs the shortfall its operation planned with (`need - holdingUsed`), never its
 * current holding: that holding contains what the operation already withdrew or received, which `withdrawnInFlight`
 * adds back to the pool, so subtracting it from the weight as well would count the same amount twice and hand the
 * planning route more than its proportional share.
 */
async function pairShortfalls(
  deps: PlannerDeps,
  self: RouteContext,
  selfShortfallE18: bigint
): Promise<Map<string, bigint>> {
  const weights = new Map<string, bigint>([[self.route.id, selfShortfallE18]]);
  for (const route of deps.config.topology.routes) {
    if (route.pairId !== self.pair.id || route.id === self.route.id) continue;
    const sibling = routeContext(deps.config, route);
    if (!sibling.thresholds) continue;
    const open = await deps.journal.listOperations({ kind: "reporter-funding", routeId: route.id, status: "open" });
    const planned = open
      .map((operation) => operation.payload as unknown as FundingPayload | null)
      .find((payload) => payload?.need !== undefined);
    if (planned) {
      const shortfall = planned.need - planned.holdingUsed;
      weights.set(route.id, messagesE18(shortfall, sibling.thresholds));
      continue;
    }
    if (open.length === 0) {
      const suspended = (await deps.journal.observations(suspendedObservationKey(route.id))).find(
        (o) => o.key === suspendedObservationKey(route.id)
      );
      const value = suspended?.value as { suspended?: boolean } | null | undefined;
      if (value?.suspended) continue;
    }
    // An unreadable sibling balance is taken as empty (its largest shortfall), never skipped: skipping it would drop
    // its weight and hand the planning route more than its proportional share.
    let balance: bigint;
    try {
      balance = await deps.funding.balance(route);
    } catch {
      balance = 0n;
    }
    if (open.length === 0 && balance >= sibling.thresholds.lowWater) continue;
    const holding = await localHolding(deps.journal, sibling);
    weights.set(route.id, messagesE18(sibling.thresholds.target - balance - holding, sibling.thresholds));
  }
  return weights;
}

/**
 * Amounts the pair's open funding operations already withdrew from the pool asset under `claimKey` (their claims
 * settled, the money not yet sent to a reporter). They left the on-chain balance but still belong to the pool the
 * shares are taken from; claims not yet withdrawn are still inside the on-chain balance.
 */
async function withdrawnInFlight(deps: PlannerDeps, pairId: string, claimKey: string): Promise<bigint> {
  const open = await deps.journal.listOperations({ kind: "reporter-funding", pairId, status: "open" });
  let total = 0n;
  for (const operation of open) {
    const payload = operation.payload as unknown as FundingPayload | null;
    const state = operation.stepPayload as unknown as FundingState | null;
    if (!payload?.legs || !state?.legs) continue;
    payload.legs.forEach((leg, index) => {
      const legState = state.legs[index];
      if (leg.claimKey === claimKey && legState && !legState.released) total += legState.withdrawn;
    });
  }
  return total;
}

/**
 * The need-sized input of every leg, derived from fields persisted since run 005 (`need`, `holdingUsed`, each leg's
 * quote): legs in order, each sized to the need its predecessors left, a same-unit leg 1:1, a cross-asset leg at its
 * quote's rate. A leg that does not transfer has no input limit (`undefined`).
 */
export function needSizedInputs(need: bigint, holdingUsed: bigint, legs: LegPlan[]): (bigint | undefined)[] {
  let remaining = need > holdingUsed ? need - holdingUsed : 0n;
  return legs.map((leg) => {
    if (!leg.transfer) {
      remaining -= leg.expectedOutput < remaining ? leg.expectedOutput : remaining;
      return undefined;
    }
    const available = leg.holdingAmount + leg.claimAmount;
    let input: bigint;
    let output: bigint;
    if (leg.quote === null) {
      input = available < remaining ? available : remaining;
      output = input;
    } else {
      const { inputAmount, estimatedOutput } = leg.quote;
      input = estimatedOutput > remaining ? mulDiv(inputAmount, remaining, estimatedOutput) : inputAmount;
      if (input > available) input = available;
      output = inputAmount === 0n ? 0n : mulDiv(estimatedOutput, input, inputAmount);
    }
    remaining -= output < remaining ? output : remaining;
    return input;
  });
}

function ceilDiv(a: bigint, b: bigint): bigint {
  return (a + b - 1n) / b;
}

/**
 * Sizes a cross-asset leg (pool asset in another unit than the reporter's native token) from one persisted quote
 * whose input is the reporter's actual need, not the whole pool share, so a small top-up is never refused by the
 * per-transfer or daily limit that a share-sized quote would hit. A rate probe quotes the whole available input
 * first; a probe the policy rejects still carries its quote (the rate is all it is used for). When the probe output
 * exceeds the remaining need, the input is reduced to the need at the probe's rate and quoted again; that quote,
 * which must pass the policy, is the one persisted and the claim is sized from.
 */
async function sizeCrossAsset(
  deps: PlannerDeps,
  ctx: RouteContext,
  asset: Asset,
  share: bigint,
  holdingAmount: bigint,
  remaining: bigint
): Promise<{ claimAmount: bigint; expectedOutput: bigint; quote: PlannedQuote; transferAmount: bigint } | null> {
  const quoteFor = (amount: bigint) =>
    deps.routeProvider.quote({
      fromChainId: asset.chainId,
      fromAsset: asset,
      toChainId: ctx.nativeAsset.chainId,
      toAsset: ctx.nativeAsset,
      amount,
      sender: deps.signer,
      recipient: deps.signer,
      purpose: "reporter",
    });
  const available = share + holdingAmount;
  const probe = await quoteFor(available);
  const rate = probe.kind === "no-route" ? undefined : probe.quote;
  if (!rate || rate.estimatedOutput <= 0n || rate.inputAmount <= 0n) return null;
  let accepted = probe.kind === "quote" ? probe.quote : undefined;
  if (rate.estimatedOutput > remaining) {
    let input = ceilDiv(rate.inputAmount * remaining, rate.estimatedOutput);
    if (input > available) input = available;
    const sized = await quoteFor(input);
    accepted = sized.kind === "quote" ? sized.quote : undefined;
  }
  if (!accepted || accepted.estimatedOutput <= 0n || accepted.inputAmount <= 0n) return null;
  const quote: PlannedQuote = {
    id: accepted.id,
    inputAmount: accepted.inputAmount,
    estimatedOutput: accepted.estimatedOutput,
  };
  // Holding first, then the claim; never more input than the quote covers, never past the remaining need.
  let input = quote.inputAmount;
  if (quote.estimatedOutput > remaining) input = mulDiv(quote.inputAmount, remaining, quote.estimatedOutput);
  let claimAmount = input > holdingAmount ? input - holdingAmount : 0n;
  if (claimAmount > share) claimAmount = share;
  const transferAmount = claimAmount + holdingAmount < input ? claimAmount + holdingAmount : input;
  const expectedOutput = mulDiv(quote.estimatedOutput, transferAmount, quote.inputAmount);
  return { claimAmount, expectedOutput, quote, transferAmount };
}

/**
 * Plans one top-up of a route below its low-water, from its own holding first, then from its proportional share
 * of its pair's bridging pool (never another pair's, never an arbitration or gas holding). The pool of an asset is
 * the on-chain bridging balance plus what the pair's open operations already withdrew from it, so a route planning
 * after another one has claimed (or withdrawn) still gets its proportional share, not the remainder; the claim is
 * still bounded by the on-chain balance minus the open claims. Reads only; claims are taken by the operation.
 */
export async function planFunding(deps: PlannerDeps, ctx: RouteContext): Promise<FundingPlan> {
  const thresholds = ctx.thresholds;
  if (!thresholds) return { kind: "suspend", reason: `no costPerMessage configured for route ${ctx.route.id}` };
  const balance = await deps.funding.balance(ctx.route);
  if (balance >= thresholds.lowWater) return { kind: "idle", balance, thresholds };

  const need = thresholds.target - balance;
  const local = await localHolding(deps.journal, ctx);
  const holdingUsed = local < need ? local : need;
  let remaining = need - holdingUsed;
  const legs: LegPlan[] = [];
  let shareE18 = 0n;

  if (remaining > 0n) {
    if (!deps.treasury) return { kind: "suspend", reason: `no ForeignGateway adapter for pair ${ctx.pair.id}` };
    const balances = await deps.treasury.balances();
    for (const entry of balances) {
      if (!ctx.pair.collectedAssets.some((a) => sameAsset(a, entry.asset))) {
        return {
          kind: "suspend",
          reason:
            `ForeignGateway of pair ${ctx.pair.id} reports unexpected asset ` +
            `${entry.asset.symbol} (${assetKey(entry.asset)})`,
        };
      }
    }
    const weights = await pairShortfalls(deps, ctx, messagesE18(remaining, thresholds));
    const totalWeight = [...weights.values()].reduce((acc, w) => acc + w, 0n);
    const selfWeight = weights.get(ctx.route.id) ?? 0n;
    shareE18 = totalWeight === 0n ? 0n : mulDiv(MESSAGE_SCALE, selfWeight, totalWeight);

    // Same-unit assets first: they need no quote and no conversion.
    const assets = [...ctx.pair.collectedAssets].sort((a, b) => Number(!sameUnit(ctx, a)) - Number(!sameUnit(ctx, b)));
    for (const configured of assets) {
      if (remaining <= 0n) break;
      const asset: Asset = { ...configured };
      const onchain = balances.find((b) => sameAsset(b.asset, asset))?.bridging ?? 0n;
      const claimKey = foreignGatewayClaimKey(ctx.pair.id, "bridging", assetKey(asset));
      const claimed = (await deps.journal.ledger.openClaims(claimKey)).reduce((acc, c) => acc + c.amount, 0n);
      const pool = onchain + (await withdrawnInFlight(deps, ctx.pair.id, claimKey));
      const claimable = onchain > claimed ? onchain - claimed : 0n;
      let share = totalWeight === 0n ? 0n : mulDiv(pool, selfWeight, totalWeight);
      if (share > claimable) share = claimable;
      const transfer = needsTransfer(ctx, asset);
      const holdingAmount = transfer ? await holdingOf(deps.journal, ctx.scope, asset) : 0n;
      if (share + holdingAmount === 0n) continue;

      let claimAmount: bigint;
      let expectedOutput: bigint;
      let quote: PlannedQuote | null = null;
      let transferAmount: bigint;
      if (sameUnit(ctx, asset)) {
        const wanted = remaining > holdingAmount ? remaining - holdingAmount : 0n;
        claimAmount = share < wanted ? share : wanted;
        transferAmount = holdingAmount + claimAmount < remaining ? holdingAmount + claimAmount : remaining;
        expectedOutput = transferAmount;
      } else {
        const sized = await sizeCrossAsset(deps, ctx, asset, share, holdingAmount, remaining);
        if (!sized) continue;
        ({ claimAmount, expectedOutput, quote, transferAmount } = sized);
      }
      if (claimAmount === 0n && holdingAmount === 0n) continue;
      legs.push({
        asset,
        claimKey,
        claimAmount,
        holdingAmount,
        transfer,
        quote,
        expectedOutput,
        ...(transfer ? { transferAmount } : {}),
      });
      remaining -= expectedOutput < remaining ? expectedOutput : remaining;
    }
  }

  const expectedTotal = holdingUsed + legs.reduce((acc, leg) => acc + leg.expectedOutput, 0n);
  const partial = expectedTotal < need;
  if (expectedTotal === 0n) {
    return { kind: "deferred", balance, thresholds, reason: "no bridging funds available for this route", short: true };
  }
  if (expectedTotal < thresholds.minTopUp) {
    return {
      kind: "deferred",
      balance,
      thresholds,
      reason: `top-up of ${expectedTotal} is under the economic minimum ${thresholds.minTopUp}`,
      short: partial,
    };
  }
  return { kind: "fund", balance, thresholds, need, holdingUsed, legs, expectedTotal, partial, shareE18 };
}
