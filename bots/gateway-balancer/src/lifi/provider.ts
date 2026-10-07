import type { Address, ChainId, Hex } from "../domain";
import type {
  Clock,
  Ledger,
  PriceOracle,
  QuoteResult,
  RouteProvider,
  RouteQuote,
  RouteRequest,
  TransferStatus,
} from "../ports";
import type { LifiClient, ParsedQuote, QuoteDetails } from "./client";
import type { LifiConfig } from "./config";
import { evaluateQuote, type Continuation } from "./policy";
import { normalizeFees } from "./slippage";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface LifiRouteProviderDeps {
  client: LifiClient;
  config: LifiConfig;
  priceOracle: PriceOracle;
  ledger: Pick<Ledger, "spentSince">;
  clock: Clock;
  signer: Address;
}

/** Options the frozen `RouteProvider.quote` cannot carry; `LifiTransfers` passes them when the provider is LI.FI's. */
export interface QuoteOptions {
  /** The leg continues a bridge-then-swap of this operation (decisions [L43]): checked against the parent's limit. */
  continuationOf?: Continuation;
}

/**
 * What the policy needs to re-evaluate a persisted quote (decisions [L44]), kept in `RouteQuote.raw.policy`: LI.FI's
 * details and the fees normalized when it was quoted.
 */
export interface PolicyContext {
  details: QuoteDetails;
  feesPaidInOutput: bigint | null;
}

/** A route provider that can re-apply its signing policy to a quote it produced (the LI.FI provider). */
export interface RecheckingRouteProvider extends RouteProvider {
  quote(request: RouteRequest, options?: QuoteOptions): Promise<QuoteResult>;
  recheck(request: RouteRequest, quote: RouteQuote, options?: QuoteOptions): string[];
}

export function isRechecking(provider: RouteProvider): provider is RecheckingRouteProvider {
  return typeof (provider as Partial<RecheckingRouteProvider>).recheck === "function";
}

/** The policy context a `LifiRouteProvider` quote carries in `raw`, or null for a quote built elsewhere. */
export function policyContextOf(raw: unknown): PolicyContext | null {
  const policy = (raw as { policy?: PolicyContext } | null)?.policy;
  return policy && typeof policy === "object" && policy.details ? policy : null;
}

/** LI.FI quotes with the signing policy applied to every one; status passes through the client. */
export class LifiRouteProvider implements RecheckingRouteProvider {
  constructor(private readonly deps: LifiRouteProviderDeps) {}

  /** The quote with its fees normalized, and every policy violation (empty when approved). */
  async evaluate(
    request: RouteRequest,
    options: QuoteOptions = {}
  ): Promise<{ kind: "no-route"; reason: string } | { kind: "evaluated"; parsed: ParsedQuote; violations: string[] }> {
    const { client, config, priceOracle, ledger, clock, signer } = this.deps;
    const result = await client.quote(request);
    if (result.kind === "no-route") return result;
    const { parsed } = result;
    const violations: string[] = [];
    const fees = await normalizeFees(priceOracle, config.priceSymbols, parsed.fees, request.toAsset);
    let feesPaidInOutput: bigint | undefined;
    if (fees.kind === "fees") {
      // The budget credit (included minus on top); the fee cap uses everything paid.
      parsed.quote.feeCostsInOutput = fees.amount;
      feesPaidInOutput = fees.included + fees.onTop;
    } else violations.push(`price: cannot normalize fees (${fees.reason})`);
    const context: PolicyContext = { details: parsed.details, feesPaidInOutput: feesPaidInOutput ?? null };
    parsed.quote.raw = { ...(parsed.quote.raw as Record<string, unknown>), policy: context };
    const spentLast24h = await ledger.spentSince({
      since: new Date(clock.now().getTime() - DAY_MS),
      chainId: request.fromChainId,
      asset: request.fromAsset.address,
      category: "transfer",
    });
    violations.push(
      ...evaluateQuote(config, {
        request,
        quote: parsed.quote,
        details: parsed.details,
        spentLast24h,
        signer,
        feesPaidInOutput,
        continuationOf: options.continuationOf,
      })
    );
    return { kind: "evaluated", parsed, violations };
  }

  async quote(request: RouteRequest, options: QuoteOptions = {}): Promise<QuoteResult> {
    const result = await this.evaluate(request, options);
    if (result.kind === "no-route") return result;
    if (result.violations.length > 0) {
      return { kind: "rejected", violations: result.violations, quote: result.parsed.quote };
    }
    return { kind: "quote", quote: result.parsed.quote };
  }

  /**
   * The current policy applied again to a persisted, unsigned quote before its approval and its send (decisions
   * [L44]): an allowlist, limit or budget the operator tightened since the quote blocks it. A quote without LI.FI's
   * details (built elsewhere) is rejected. The daily limit is left to the transfer's send-time check, which knows
   * whether the leg's own spend is already counted.
   */
  recheck(request: RouteRequest, quote: RouteQuote, options: QuoteOptions = {}): string[] {
    const context = policyContextOf(quote.raw);
    if (!context) return ["policy: the persisted quote carries no LI.FI details to re-evaluate"];
    return evaluateQuote(this.deps.config, {
      request,
      quote,
      details: context.details,
      spentLast24h: 0n,
      signer: this.deps.signer,
      feesPaidInOutput: context.feesPaidInOutput ?? undefined,
      continuationOf: options.continuationOf,
    }).filter((violation) => !violation.startsWith("daily-limit:"));
  }

  status(ref: { tool: string; txHash: Hex; fromChainId: ChainId; toChainId: ChainId }): Promise<TransferStatus> {
    return this.deps.client.status(ref);
  }
}
