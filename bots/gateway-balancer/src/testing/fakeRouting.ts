import { isNative, type Address, type Hex } from "../domain";
import type {
  Journal,
  QuoteResult,
  RouteProvider,
  RouteQuote,
  RouteRequest,
  TransferIntent,
  TransferOutcome,
  TransferStatus,
  Transfers,
} from "../ports";
import { fakeHash } from "./fakeExecutor";

export const FAKE_LIFI_DIAMOND: Address = "0x1231deb6f5749ef6ce6943a275a1d3e7486f4eae";

/** A plausible quote for a request: one approve step for an ERC20 input, then one cross step; 1:1 output by default. */
export function makeQuote(request: RouteRequest, overrides: Partial<RouteQuote> = {}): RouteQuote {
  const steps: RouteQuote["steps"] = [];
  if (!isNative(request.fromAsset)) {
    steps.push({
      kind: "approve",
      chainId: request.fromChainId,
      tool: "erc20",
      target: request.fromAsset.address as Address,
      spender: FAKE_LIFI_DIAMOND,
      approvalAmount: request.amount,
      tx: { chainId: request.fromChainId, to: request.fromAsset.address as Address, data: "0x095ea7b3", value: 0n },
    });
  }
  steps.push({
    kind: request.fromChainId === request.toChainId ? "swap" : "cross",
    chainId: request.fromChainId,
    tool: "fake-bridge",
    target: FAKE_LIFI_DIAMOND,
    tx: {
      chainId: request.fromChainId,
      to: FAKE_LIFI_DIAMOND,
      data: "0xdeadbeef",
      value: isNative(request.fromAsset) ? request.amount : 0n,
    },
  });
  return {
    id: `quote-${fakeHash(JSON.stringify({ ...request, amount: request.amount.toString() })).slice(2, 10)}`,
    tool: "fake-bridge",
    fromChainId: request.fromChainId,
    toChainId: request.toChainId,
    fromAsset: { ...request.fromAsset },
    toAsset: { ...request.toAsset },
    inputAmount: request.amount,
    estimatedOutput: request.amount,
    minimumOutput: request.amount,
    feeCostsInOutput: 0n,
    gasCostsNative: 0n,
    steps,
    deliversWrapped: false,
    expiresAt: null,
    raw: null,
    ...overrides,
  };
}

type QuoteScript = {
  match: (request: RouteRequest) => boolean;
  result: QuoteResult | ((request: RouteRequest) => QuoteResult);
};

export class FakeRouteProvider implements RouteProvider {
  readonly requests: RouteRequest[] = [];
  readonly quotes: QuoteScript[] = [];
  readonly statuses = new Map<Hex, TransferStatus>();

  onQuote(match: (request: RouteRequest) => boolean, result: QuoteScript["result"]): this {
    this.quotes.push({ match, result });
    return this;
  }

  async quote(request: RouteRequest): Promise<QuoteResult> {
    this.requests.push({ ...request });
    const script = this.quotes.find((q) => q.match(request));
    if (!script) return { kind: "no-route", reason: "no fake quote scripted" };
    return typeof script.result === "function" ? script.result(request) : script.result;
  }

  async status(ref: { tool: string; txHash: Hex }): Promise<TransferStatus> {
    return this.statuses.get(ref.txHash) ?? { state: "unknown", detail: "no fake status scripted" };
  }
}

type TransferScript = {
  match: (intent: TransferIntent) => boolean;
  outcome: TransferOutcome | ((intent: TransferIntent) => TransferOutcome);
};

/**
 * Default: every transfer completes 1:1 with the allocations unchanged. Idempotent per (parent, tag). Given a journal,
 * it performs the ledger moves the real `Transfers` owns: on a completed run it debits the source `eoa` holding of
 * each allocation on the source chain and credits the destination `eoa` holding per `receivedByScope` on the
 * destination chain. Callers never credit or debit around a transfer themselves.
 */
export class FakeTransfers implements Transfers {
  readonly intents: TransferIntent[] = [];
  readonly scripts: TransferScript[] = [];
  readonly outcomes = new Map<string, TransferOutcome>();

  constructor(private readonly journal?: Journal) {}

  onRun(match: (intent: TransferIntent) => boolean, outcome: TransferScript["outcome"]): this {
    this.scripts.push({ match, outcome });
    return this;
  }

  async run(intent: TransferIntent): Promise<TransferOutcome> {
    const key = `${intent.parentOperationId}:${intent.tag}`;
    const existing = this.outcomes.get(key);
    if (existing) return existing;
    this.intents.push({ ...intent, allocations: intent.allocations.map((a) => ({ ...a, scope: { ...a.scope } })) });
    const script = this.scripts.find((s) => s.match(intent));
    const outcome: TransferOutcome = script
      ? typeof script.outcome === "function"
        ? script.outcome(intent)
        : script.outcome
      : {
          status: "completed",
          operationId: `transfer-${key}`,
          received: intent.amount,
          receivedByScope: intent.allocations.map((a) => ({ ...a, scope: { ...a.scope } })),
          realizedLossBps: 0,
          txHashes: [fakeHash(key)],
        };
    if (outcome.status !== "deferred") this.outcomes.set(key, outcome);
    if (this.journal && outcome.status === "completed") {
      for (const allocation of intent.allocations) {
        await this.journal.ledger.debit({
          scope: allocation.scope,
          chainId: intent.fromChainId,
          asset: intent.fromAsset.address,
          location: "eoa",
          amount: allocation.amount,
          operationId: outcome.operationId,
          reason: "transfer sent",
        });
      }
      for (const received of outcome.receivedByScope) {
        if (received.amount <= 0n) continue;
        await this.journal.ledger.credit({
          scope: received.scope,
          chainId: intent.toChainId,
          asset: intent.toAsset.address,
          location: "eoa",
          amount: received.amount,
          operationId: outcome.operationId,
          reason: "transfer received",
        });
      }
    }
    return outcome;
  }
}
