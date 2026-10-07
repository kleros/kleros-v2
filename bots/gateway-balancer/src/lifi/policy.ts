import { parseUnits } from "viem";
import { NATIVE, sameAsset, type Address, type Asset, type ChainId } from "../domain";
import type { RouteQuote, RouteRequest } from "../ports";
import type { QuoteDetails } from "./client";
import type { LifiConfig } from "./config";
import { checkCalldata, diamondToken } from "./calldata";
import { withinBudget } from "./slippage";

/**
 * The transaction policy applied to every LI.FI quote before anything is signed (specification 5.3). Pure:
 * returns every violation found, empty when the quote may be executed. Violation strings start with a stable
 * kind (`chain:`, `asset:`, `tool:`, `target:`, `spender:`, `recipient:`, `value:`, `approval:`, `amount:`,
 * `limit:`, `daily-limit:`, `budget:`, `fee:`, `route:`, `calldata:`).
 */

/**
 * The parent leg of a bridge-then-swap continuation (decisions [L43], [L50]): the operation's own first input. A
 * continuation spends the intermediate asset this operation delivered (verified by the credit gate). It is exempt
 * from the `lifi.limits` entry only: its input must still be in `allowedAssets` (how the operator names the
 * intermediate tokens it accepts) and must be the parent bridge step's declared output token; the parent's limit
 * entry is checked against the parent's input, and the daily spend was counted once, by the parent leg.
 */
export interface Continuation {
  chainId: ChainId;
  asset: Asset;
  amount: bigint;
  /** The parent bridge step's declared output token (`bridgeOutput` of its quote); null when it reported none. */
  bridgeOutput: string | null;
}

export interface PolicyInput {
  request: RouteRequest;
  quote: RouteQuote;
  /** From the parsed LI.FI response; absent for a quote built elsewhere (then only the quote is checked). */
  details?: QuoteDetails;
  /** `transfer` spends of the source chain and asset in the last 24 hours (`Ledger.spentSince`). */
  spentLast24h: bigint;
  signer: Address;
  /**
   * Every quoted fee in output units, included or paid on top, for the fee cap. Defaults to the quote's
   * `feeCostsInOutput` (the budget credit: included fees minus fees paid on top) when it is not negative.
   */
  feesPaidInOutput?: bigint;
  /** Set for the continuation leg of a bridge-then-swap transfer. */
  continuationOf?: Continuation;
}

const lower = (value: string) => value.toLowerCase();

function hasChainAddress(list: readonly { chainId: number; address: string }[], chainId: ChainId, address: string) {
  return list.some((entry) => entry.chainId === chainId && lower(entry.address) === lower(address));
}

function assetLabel(asset: Pick<Asset, "chainId" | "address" | "symbol">): string {
  return `${asset.symbol}@${asset.chainId}:${asset.address}`;
}

function chainAddresses(list: readonly { chainId: number; address: Address }[], chainId: ChainId): Address[] {
  return list.filter((entry) => entry.chainId === chainId).map((entry) => entry.address);
}

export function findLimit(config: LifiConfig, chainId: ChainId, asset: string) {
  return config.limits.find((l) => l.chainId === chainId && lower(l.asset) === lower(asset));
}

export function evaluateQuote(config: LifiConfig, input: PolicyInput): string[] {
  const { request, quote, details, signer } = input;
  const violations: string[] = [];
  const allowedChains = new Set(config.allowedChains);
  const allowedTools = new Set(config.allowedTools);

  // Chains: requested and quoted, every step, nothing switched in between.
  const chains = new Set<ChainId>([request.fromChainId, request.toChainId, quote.fromChainId, quote.toChainId]);
  for (const step of quote.steps) chains.add(step.chainId).add(step.tx.chainId);
  for (const chainId of details?.chainIds ?? []) chains.add(chainId);
  for (const chainId of chains)
    if (!allowedChains.has(chainId)) violations.push(`chain: ${chainId} is not allowlisted`);
  if (quote.fromChainId !== request.fromChainId || quote.toChainId !== request.toChainId) {
    violations.push(
      `route: quoted ${quote.fromChainId}->${quote.toChainId}, requested ${request.fromChainId}->${request.toChainId}`
    );
  }
  for (const chainId of details?.chainIds ?? []) {
    if (chainId !== request.fromChainId && chainId !== request.toChainId) {
      violations.push(`route: a step switches to chain ${chainId}`);
    }
  }

  // Assets: LI.FI's reported tokens match the configured ones (decimals included, checked before scaling); the
  // quote moves exactly the requested assets; both are allowlisted.
  violations.push(...(details?.tokenViolations ?? []));
  const isAllowedAsset = (asset: Pick<Asset, "chainId" | "address">) =>
    config.allowedAssets.some((a) => a.chainId === asset.chainId && lower(a.address) === lower(asset.address));
  const continuation = input.continuationOf;
  for (const asset of [request.fromAsset, request.toAsset]) {
    if (!isAllowedAsset(asset)) violations.push(`asset: ${assetLabel(asset)} is not allowlisted`);
  }
  if (continuation) {
    // The continuation spends what the parent bridge declared it delivers, nothing else (decisions [L50]).
    if (continuation.bridgeOutput === null) {
      violations.push(`asset: the parent bridge declared no output token for the continuation input`);
    } else if (lower(continuation.bridgeOutput) !== lower(request.fromAsset.address)) {
      violations.push(
        `asset: the parent bridge delivers ${continuation.bridgeOutput}, not the continuation input ` +
          `${assetLabel(request.fromAsset)}`
      );
    }
  }
  if (!sameAsset(quote.fromAsset, request.fromAsset)) {
    violations.push(`asset: quote spends ${assetLabel(quote.fromAsset)}, requested ${assetLabel(request.fromAsset)}`);
  }
  if (!sameAsset(quote.toAsset, request.toAsset)) {
    const wrappedOk = quote.deliversWrapped && request.toAsset.address === NATIVE && isAllowedAsset(quote.toAsset);
    if (!wrappedOk) {
      violations.push(`asset: quote delivers ${assetLabel(quote.toAsset)}, requested ${assetLabel(request.toAsset)}`);
    }
  }

  // Tools, targets and spenders.
  const tools = new Set<string>([quote.tool, ...(details?.includedTools ?? [])]);
  for (const step of quote.steps) if (step.kind !== "approve") tools.add(step.tool);
  for (const tool of tools) if (!allowedTools.has(tool)) violations.push(`tool: ${tool} is not allowlisted`);
  let totalValue = 0n;
  for (const step of quote.steps) {
    if (step.chainId !== request.fromChainId || step.tx.chainId !== request.fromChainId) {
      violations.push(`route: step ${step.kind} executes on chain ${step.tx.chainId}, not the source chain`);
    }
    if (step.kind === "approve") {
      if (request.fromAsset.address === NATIVE || lower(step.target) !== lower(request.fromAsset.address)) {
        violations.push(`target: approval on ${step.target} is not the input token`);
      }
      if (lower(step.tx.to) !== lower(step.target)) violations.push(`target: approval sent to ${step.tx.to}`);
      if (step.tx.value !== 0n) violations.push(`value: approval carries native value ${step.tx.value}`);
      if (step.spender === undefined)
        violations.push("approval: the quote names no approvalAddress for an ERC20 input");
      if (step.approvalAmount === undefined) violations.push("approval: unbounded (no approval amount)");
      else if (step.approvalAmount > quote.inputAmount) {
        violations.push(`approval: ${step.approvalAmount} exceeds the input ${quote.inputAmount}`);
      }
    } else {
      if (lower(step.tx.to) !== lower(step.target))
        violations.push(`target: step sends to ${step.tx.to}, not its target`);
      if (!hasChainAddress(config.allowedTargets, step.tx.chainId, step.tx.to)) {
        violations.push(`target: ${step.tx.to} on chain ${step.tx.chainId} is not allowlisted`);
      }
      totalValue += step.tx.value;
      // The calldata itself: receiver, destination chain, assets and amounts must agree with the quote.
      violations.push(
        ...checkCalldata(step.tx.data, {
          signer,
          tool: quote.tool,
          fromChainId: request.fromChainId,
          toChainId: request.toChainId,
          fromToken: diamondToken(request.fromAsset.address),
          toToken: diamondToken(quote.toAsset.address),
          inputAmount: quote.inputAmount,
          minimumOutput: quote.minimumOutput,
          bridgeInput: details?.bridgeInput ?? undefined,
          sourceSwaps: details?.sourceSwaps,
          swapContracts: chainAddresses(config.allowedSwapContracts, request.fromChainId),
          layerSwapDepositories: chainAddresses(config.layerSwapDepositories, request.fromChainId),
          diamond: step.tx.to,
          feeRecipients: chainAddresses(config.feeRecipients, request.fromChainId),
          maxFeeBps: config.maxFeeBps,
        })
      );
    }
    if (step.spender !== undefined && !hasChainAddress(config.allowedSpenders, step.chainId, step.spender)) {
      violations.push(`spender: ${step.spender} on chain ${step.chainId} is not allowlisted`);
    }
  }
  if (request.fromAsset.address !== NATIVE && !quote.steps.some((s) => s.kind === "approve")) {
    violations.push("approval: an ERC20 input without a bounded approval step");
  }

  // Recipients: everything comes from and goes to the bot EOA.
  if (lower(request.recipient) !== lower(signer)) violations.push(`recipient: ${request.recipient} is not the signer`);
  if (lower(request.sender) !== lower(signer)) violations.push(`recipient: sender ${request.sender} is not the signer`);
  if (details) {
    if (details.recipient === null || lower(details.recipient) !== lower(signer)) {
      violations.push(`recipient: quote delivers to ${details.recipient ?? "an unspecified address"}, not the signer`);
    }
    if (details.sender !== null && lower(details.sender) !== lower(signer)) {
      violations.push(`recipient: quote sender ${details.sender} is not the signer`);
    }
    if (details.txFrom !== null && lower(details.txFrom) !== lower(signer)) {
      violations.push(`recipient: transaction from ${details.txFrom} is not the signer`);
    }
  }

  // Amounts: input, native value, limits.
  const dust = details?.dustAllowance ?? 0n;
  if (quote.inputAmount > request.amount || request.amount - quote.inputAmount > dust) {
    violations.push(`amount: quote input ${quote.inputAmount} differs from the requested ${request.amount}`);
  }
  const expectedValue =
    (request.fromAsset.address === NATIVE ? quote.inputAmount : 0n) + (details?.extraNativeValue ?? 0n);
  if (totalValue !== expectedValue) {
    violations.push(`value: native value ${totalValue} differs from the expected ${expectedValue}`);
  }
  if (continuation) {
    // The parent's entry, against the parent's input; no second daily spend (decisions [L43]).
    const limit = findLimit(config, continuation.chainId, continuation.asset.address);
    if (!limit) {
      violations.push(
        `limit: no per-transfer and daily limit configured for the parent ${assetLabel(continuation.asset)}`
      );
    } else {
      const perTransfer = parseUnits(limit.perTransfer, limit.decimals);
      if (continuation.amount > perTransfer) {
        violations.push(`limit: the parent input ${continuation.amount} exceeds the per-transfer limit ${perTransfer}`);
      }
    }
  } else {
    const limit = findLimit(config, request.fromChainId, request.fromAsset.address);
    if (!limit) {
      violations.push(`limit: no per-transfer and daily limit configured for ${assetLabel(request.fromAsset)}`);
    } else {
      const perTransfer = parseUnits(limit.perTransfer, limit.decimals);
      const daily = parseUnits(limit.daily, limit.decimals);
      if (quote.inputAmount > perTransfer) {
        violations.push(`limit: ${quote.inputAmount} exceeds the per-transfer limit ${perTransfer}`);
      }
      if (input.spentLast24h + quote.inputAmount > daily) {
        violations.push(`daily-limit: ${input.spentLast24h} spent in 24h plus ${quote.inputAmount} exceeds ${daily}`);
      }
    }
  }

  // Output: the operation-level budget and the fee cap.
  if (quote.minimumOutput > quote.estimatedOutput) violations.push("budget: minimum output above the estimate");
  if (
    request.minimumOutput !== undefined &&
    !withinBudget({
      legMinimum: request.minimumOutput,
      quoteMinimumOutput: quote.minimumOutput,
      feesInOutput: quote.feeCostsInOutput,
    })
  ) {
    violations.push(
      `budget: minimum output ${quote.minimumOutput} plus fees ${quote.feeCostsInOutput} is under ` +
        `${request.minimumOutput}`
    );
  }
  const paid = input.feesPaidInOutput ?? (quote.feeCostsInOutput > 0n ? quote.feeCostsInOutput : 0n);
  const gross = quote.estimatedOutput + paid;
  if (paid * 10_000n > BigInt(config.maxQuotedFeeBps) * gross) {
    violations.push(`fee: quoted fees ${paid} exceed ${config.maxQuotedFeeBps} bps of the output`);
  }
  return violations;
}
