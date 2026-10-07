import { encodeFunctionData, erc20Abi, getAddress, zeroAddress } from "viem";
import { z } from "zod";
import type { ChainConfig } from "../config/schema";
import { NATIVE, type Address, type Asset, type ChainId, type Hex } from "../domain";
import type { RouteQuote, RouteRequest, RouteStep, TransferStatus } from "../ports";
import type { LifiConfig } from "./config";

/** LI.FI REST client (`/v1/quote`, `/v1/status`, `/v1/tools`) through the injected `fetch`. Never signs. */

const intString = z.string().regex(/^\d+$/);
const hexString = z.string().regex(/^0x[0-9a-fA-F]*$/);

const tokenSchema = z.object({
  address: z.string(),
  chainId: z.number(),
  symbol: z.string(),
  decimals: z.number().int(),
  priceUSD: z.string().optional(),
});

const costSchema = z.object({
  amount: intString,
  token: tokenSchema,
  included: z.boolean().optional(),
  name: z.string().optional(),
});

const actionSchema = z.object({
  fromChainId: z.number(),
  toChainId: z.number(),
  fromToken: tokenSchema,
  toToken: tokenSchema,
  fromAmount: intString,
  fromAddress: z.string().optional(),
  toAddress: z.string().optional(),
});

const quoteBodySchema = z.object({
  id: z.string(),
  type: z.string(),
  tool: z.string(),
  action: actionSchema,
  estimate: z.object({
    approvalAddress: z.string().optional(),
    toAmount: intString,
    toAmountMin: intString,
    fromAmount: intString.optional(),
    feeCosts: z.array(costSchema).default([]),
    gasCosts: z.array(costSchema).default([]),
  }),
  includedSteps: z
    .array(
      z.object({
        type: z.string(),
        tool: z.string(),
        action: z.object({
          fromChainId: z.number(),
          toChainId: z.number(),
          fromToken: tokenSchema.optional(),
          toToken: tokenSchema.optional(),
          fromAmount: intString.optional(),
        }),
        estimate: z
          .object({ approvalAddress: z.string().optional(), toAmount: intString, toAmountMin: intString })
          .partial()
          .optional(),
      })
    )
    .default([]),
  transactionRequest: z.object({
    to: z.string(),
    data: hexString,
    value: z.string(),
    from: z.string().optional(),
    chainId: z.number(),
  }),
  transactionId: z.string().optional(),
});

const errorBodySchema = z.object({ message: z.string().optional(), code: z.number().optional() }).passthrough();

const statusBodySchema = z
  .object({
    status: z.string(),
    substatus: z.string().optional(),
    substatusMessage: z.string().optional(),
    tool: z.string().optional(),
    receiving: z
      .object({
        txHash: z.string().optional(),
        chainId: z.number().optional(),
        amount: intString.optional(),
        token: tokenSchema.optional(),
      })
      .partial()
      .optional(),
  })
  .passthrough();

export type LifiToken = z.infer<typeof tokenSchema>;

/** A quoted fee as LI.FI reports it, in the fee token's LI.FI units. */
export interface QuotedFee {
  name: string;
  amount: bigint;
  token: LifiToken;
  /** Deducted from the input (already reflected in the output) rather than paid on top. */
  included: boolean;
}

/** Fields of a quote the policy checks that `RouteQuote` does not carry. */
export interface QuoteDetails {
  sender: Address | null;
  recipient: Address | null;
  txFrom: Address | null;
  /** Every tool of the included steps (LI.FI's fee collection, the bridge, a destination swap). */
  includedTools: string[];
  /** Every chain any included step or the transaction touches. */
  chainIds: ChainId[];
  /** Native value paid on top of the input (fees not included in the input). */
  extraNativeValue: bigint;
  /** How much less than the requested amount LI.FI's unit granularity may quote (Arc's 6-decimal native USDC). */
  dustAllowance: bigint;
  /**
   * What the bridge step receives after source swaps (LI.FI's fee collection), as the Diamond sees it: the zero
   * address for a native asset, the amount in the chain's units. Null when the quote has no cross-chain step.
   */
  bridgeInput: { token: Address; amount: bigint } | null;
  /**
   * Every included step that runs on the source chain before the bridge (LI.FI's fee collection, a DEX swap), in
   * order, as the Diamond sees it (`SwapData[]` must match it item by item). Empty when none is reported.
   */
  sourceSwaps: SourceSwapStep[];
  /**
   * Mismatches between LI.FI's `fromToken`/`toToken` and the configured assets (address, chain, decimals), found
   * before any amount is scaled; each one rejects the quote (`asset:`).
   */
  tokenViolations: string[];
  /** LI.FI's own USD prices of the tokens involved; informational (the probe), never the bot's baseline. */
  reportedPricesUsd: Record<string, string>;
}

/** One included source-chain step of a quote, in the Diamond's terms (zero address for native, chain units). */
export interface SourceSwapStep {
  tool: string;
  fromToken: Address;
  toToken: Address;
  fromAmount: bigint;
  /** The step's own `estimate.approvalAddress` (the contract the Diamond approves for it), when reported. */
  approvalAddress: Address | null;
  /** The step's own estimated and minimum output (chain units of `toToken`), when reported. */
  toAmount: bigint | null;
  toAmountMin: bigint | null;
}

/**
 * The bridge step's delivered token and estimate as a bot asset address (`native` or the token), carried in
 * `RouteQuote.raw` so the transfer can record a balance baseline for it at send (decisions [L39]).
 */
export interface BridgeOutput {
  address: Address | "native";
  estimate: string | null;
}

export interface ParsedQuote {
  /** `feeCostsInOutput` is 0 until `normalizeFees` sets it. */
  quote: RouteQuote;
  fees: QuotedFee[];
  details: QuoteDetails;
}

export type LifiQuoteResult = { kind: "quote"; parsed: ParsedQuote } | { kind: "no-route"; reason: string };

export interface LifiClientOptions {
  fetch: typeof globalThis.fetch;
  config: LifiConfig;
  chains: readonly ChainConfig[];
}

function scale(amount: bigint, fromDecimals: number, toDecimals: number): bigint {
  if (fromDecimals === toDecimals) return amount;
  if (fromDecimals < toDecimals) return amount * 10n ** BigInt(toDecimals - fromDecimals);
  return amount / 10n ** BigInt(fromDecimals - toDecimals);
}

/** Maps between the bot's assets (`native`, topology decimals) and LI.FI's tokens. */
export class LifiAssets {
  constructor(
    private readonly config: LifiConfig,
    private readonly chains: readonly ChainConfig[]
  ) {}

  private nativeOverride(chainId: ChainId) {
    return this.config.nativeTokens.find((t) => t.chainId === chainId);
  }

  private nativeDecimals(chainId: ChainId): number {
    return this.chains.find((c) => c.id === chainId)?.nativeDecimals ?? 18;
  }

  wrappedNative(chainId: ChainId): Address | undefined {
    return this.chains.find((c) => c.id === chainId)?.wrappedNative;
  }

  tokenAddress(asset: Pick<Asset, "chainId" | "address">): Address {
    if (asset.address !== NATIVE) return asset.address;
    return this.nativeOverride(asset.chainId)?.address ?? zeroAddress;
  }

  /** LI.FI's decimals for an asset (differs from ours only for an overridden native token). */
  lifiDecimals(asset: Pick<Asset, "chainId" | "address" | "decimals">): number {
    if (asset.address !== NATIVE) return asset.decimals;
    return this.nativeOverride(asset.chainId)?.decimals ?? asset.decimals;
  }

  isNativeToken(chainId: ChainId, address: string): boolean {
    const lower = address.toLowerCase();
    if (lower === zeroAddress || lower === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") return true;
    return this.nativeOverride(chainId)?.address.toLowerCase() === lower;
  }

  /** A LI.FI token as a bot asset, in the bot's decimals. */
  toAsset(token: LifiToken): Asset {
    if (this.isNativeToken(token.chainId, token.address)) {
      return {
        chainId: token.chainId,
        address: NATIVE,
        symbol: token.symbol,
        decimals: this.nativeDecimals(token.chainId),
      };
    }
    return {
      chainId: token.chainId,
      address: getAddress(token.address),
      symbol: token.symbol,
      decimals: token.decimals,
    };
  }

  /** A LI.FI amount of `token` in the bot's units of the same asset. */
  fromLifi(amount: bigint, token: LifiToken): bigint {
    return scale(amount, token.decimals, this.toAsset(token).decimals);
  }

  toLifi(amount: bigint, asset: Pick<Asset, "chainId" | "address" | "decimals">): bigint {
    return scale(amount, asset.decimals, this.lifiDecimals(asset));
  }
}

function asAddress(value: string | undefined): Address | null {
  if (!value) return null;
  try {
    return getAddress(value);
  } catch {
    return null;
  }
}

export class LifiClient {
  readonly assets: LifiAssets;

  constructor(private readonly options: LifiClientOptions) {
    this.assets = new LifiAssets(options.config, options.chains);
  }

  private url(path: string, params: Record<string, string | undefined>): string {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) if (value !== undefined) query.set(key, value);
    return `${this.options.config.endpoint.replace(/\/$/, "")}/${path}?${query.toString()}`;
  }

  private async get(path: string, params: Record<string, string | undefined>) {
    const response = await this.options.fetch(this.url(path, params), { headers: { accept: "application/json" } });
    const text = await response.text();
    let body: unknown = null;
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
    return { status: response.status, body };
  }

  /** One-step quote with its `transactionRequest`; chain switching is never allowed. */
  async quote(request: RouteRequest): Promise<LifiQuoteResult> {
    const { config } = this.options;
    const fromAmount = this.assets.toLifi(request.amount, request.fromAsset);
    if (fromAmount <= 0n) return { kind: "no-route", reason: "amount is below LI.FI's unit" };
    const { status, body } = await this.get("quote", {
      fromChain: String(request.fromChainId),
      toChain: String(request.toChainId),
      fromToken: this.assets.tokenAddress(request.fromAsset),
      toToken: this.assets.tokenAddress(request.toAsset),
      fromAmount: fromAmount.toString(),
      fromAddress: request.sender,
      toAddress: request.recipient,
      slippage: String(config.requestSlippage),
      allowSwitchChain: "false",
      integrator: config.integrator,
    });
    if (status !== 200) {
      const error = errorBodySchema.safeParse(body);
      const code = error.success ? error.data.code : undefined;
      const message = error.success ? (error.data.message ?? "") : "";
      // Only the quote endpoint's "no available quotes" answer is a route gap (decisions [L49]); any other 404 (a
      // wrong endpoint path) or error code is a failure, never a legitimate steady state.
      if (status === 404 && code === 1002) {
        return { kind: "no-route", reason: `LI.FI ${status}${code ? ` code ${code}` : ""}: ${message}`.trim() };
      }
      throw new Error(`LI.FI quote failed: HTTP ${status}${code ? ` code ${code}` : ""} ${message}`.trim());
    }
    return { kind: "quote", parsed: this.parseQuote(quoteBodySchema.parse(body), request) };
  }

  /**
   * LI.FI's reported tokens against the configured assets, before any scaling: a wrong address, chain or decimals
   * (a `toToken.decimals` of 6 for an 18-decimal asset would inflate the minimum output by 1e12) rejects the quote.
   */
  tokenViolations(action: z.infer<typeof actionSchema>, request: RouteRequest): string[] {
    const violations: string[] = [];
    const check = (side: "fromToken" | "toToken", token: LifiToken, asset: Asset) => {
      const label = `${asset.symbol}@${asset.chainId}`;
      const expected: { address: string; decimals: number }[] = [
        { address: this.assets.tokenAddress(asset), decimals: this.assets.lifiDecimals(asset) },
      ];
      if (asset.address === NATIVE) {
        expected.push({ address: zeroAddress, decimals: this.assets.lifiDecimals(asset) });
        const wrapped = this.assets.wrappedNative(asset.chainId);
        // A wrapped delivery of the native output (unwrapped after receipt); WETH has the native unit's decimals.
        if (side === "toToken" && wrapped) expected.push({ address: wrapped, decimals: asset.decimals });
      }
      if (token.chainId !== asset.chainId) {
        violations.push(`asset: LI.FI ${side} is on chain ${token.chainId}, configured ${label}`);
        return;
      }
      const match = expected.find((e) => e.address.toLowerCase() === token.address.toLowerCase());
      if (!match) {
        violations.push(`asset: LI.FI ${side} ${token.address} is not the configured ${label}`);
      } else if (match.decimals !== token.decimals) {
        violations.push(
          `asset: LI.FI ${side} decimals ${token.decimals} differ from the configured ${match.decimals} of ${label}`
        );
      }
    };
    check("fromToken", action.fromToken, request.fromAsset);
    check("toToken", action.toToken, request.toAsset);
    return violations;
  }

  parseQuote(body: z.infer<typeof quoteBodySchema>, request: RouteRequest): ParsedQuote {
    const { action, estimate, transactionRequest: txRequest } = body;
    const tokenViolations = this.tokenViolations(action, request);
    const fromAsset = this.assets.toAsset(action.fromToken);
    const toAsset = this.assets.toAsset(action.toToken);
    const inputAmount = this.assets.fromLifi(BigInt(action.fromAmount), action.fromToken);
    const fromNative = fromAsset.address === NATIVE;
    const spender = asAddress(estimate.approvalAddress) ?? undefined;
    const steps: RouteStep[] = [];
    if (!fromNative) {
      const token = fromAsset.address as Address;
      steps.push({
        kind: "approve",
        chainId: action.fromChainId,
        tool: "approve",
        target: token,
        spender,
        // Bounded to exactly the step's input; the bot encodes the approval itself.
        approvalAmount: inputAmount,
        tx: {
          chainId: action.fromChainId,
          to: token,
          value: 0n,
          data: spender
            ? encodeFunctionData({ abi: erc20Abi, functionName: "approve", args: [spender, inputAmount] })
            : undefined,
        },
      });
    }
    steps.push({
      kind: action.fromChainId === action.toChainId ? "swap" : "cross",
      chainId: txRequest.chainId,
      tool: body.tool,
      target: getAddress(txRequest.to),
      spender: fromNative ? undefined : spender,
      tx: {
        chainId: txRequest.chainId,
        to: getAddress(txRequest.to),
        data: txRequest.data as Hex,
        value: BigInt(txRequest.value),
      },
    });
    const fees: QuotedFee[] = estimate.feeCosts.map((cost) => ({
      name: cost.name ?? "fee",
      amount: BigInt(cost.amount),
      token: cost.token,
      // A fee without the flag is treated as paid on top (decisions [L49]): it reduces the net output and, when
      // native on the source chain, is expected in the transaction's value; never assumed inside the input.
      included: cost.included === true,
    }));
    const extraNativeValue = fees
      .filter((fee) => !fee.included && this.assets.isNativeToken(action.fromChainId, fee.token.address))
      .filter((fee) => fee.token.chainId === action.fromChainId)
      .reduce((acc, fee) => acc + this.assets.fromLifi(fee.amount, fee.token), 0n);
    const lifiDecimals = this.assets.lifiDecimals(request.fromAsset);
    const dustAllowance =
      request.fromAsset.decimals > lifiDecimals ? 10n ** BigInt(request.fromAsset.decimals - lifiDecimals) - 1n : 0n;
    const wrapped = this.assets.wrappedNative(action.toChainId);
    const deliversWrapped =
      request.toAsset.address === NATIVE &&
      wrapped !== undefined &&
      action.toToken.address.toLowerCase() === wrapped.toLowerCase();
    const chainIds = new Set<ChainId>([action.fromChainId, action.toChainId, txRequest.chainId]);
    for (const step of body.includedSteps) {
      chainIds.add(step.action.fromChainId);
      chainIds.add(step.action.toChainId);
    }
    const quote: RouteQuote = {
      id: body.id,
      tool: body.tool,
      fromChainId: action.fromChainId,
      toChainId: action.toChainId,
      fromAsset,
      toAsset,
      inputAmount,
      estimatedOutput: this.assets.fromLifi(BigInt(estimate.toAmount), action.toToken),
      minimumOutput: this.assets.fromLifi(BigInt(estimate.toAmountMin), action.toToken),
      feeCostsInOutput: 0n,
      gasCostsNative: estimate.gasCosts.reduce((acc, cost) => acc + BigInt(cost.amount), 0n),
      steps,
      deliversWrapped,
      expiresAt: null,
      raw: {
        id: body.id,
        type: body.type,
        tool: body.tool,
        transactionId: body.transactionId ?? null,
        includedTools: body.includedSteps.map((s) => s.tool),
        bridgeOutput: this.bridgeOutput(body.includedSteps),
      },
    };
    return {
      quote,
      fees,
      details: {
        sender: asAddress(action.fromAddress),
        recipient: asAddress(action.toAddress),
        txFrom: asAddress(txRequest.from),
        includedTools: body.includedSteps.map((s) => s.tool),
        chainIds: [...chainIds],
        extraNativeValue,
        dustAllowance,
        bridgeInput: this.bridgeInput(body.includedSteps),
        sourceSwaps: this.sourceSwaps(body.includedSteps),
        tokenViolations,
        reportedPricesUsd: Object.fromEntries(
          [action.fromToken, action.toToken, ...fees.map((f) => f.token)]
            .filter((t) => t.priceUSD !== undefined)
            .map((t) => [t.symbol, t.priceUSD!])
        ),
      },
    };
  }

  private bridgeInput(steps: z.infer<typeof quoteBodySchema>["includedSteps"]): QuoteDetails["bridgeInput"] {
    const cross = steps.find((s) => s.type === "cross" && s.action.fromChainId !== s.action.toChainId);
    const token = cross?.action.fromToken;
    if (!cross || !token || cross.action.fromAmount === undefined) return null;
    return {
      token: this.assets.isNativeToken(token.chainId, token.address) ? zeroAddress : getAddress(token.address),
      amount: this.assets.fromLifi(BigInt(cross.action.fromAmount), token),
    };
  }

  private bridgeOutput(steps: z.infer<typeof quoteBodySchema>["includedSteps"]): BridgeOutput | null {
    const cross = steps.find((s) => s.type === "cross" && s.action.fromChainId !== s.action.toChainId);
    const token = cross?.action.toToken;
    if (!cross || !token) return null;
    const asset = this.assets.toAsset(token);
    const amount = cross.estimate?.toAmount;
    return {
      address: asset.address,
      estimate: amount === undefined ? null : this.assets.fromLifi(BigInt(amount), token).toString(),
    };
  }

  private sourceSwaps(steps: z.infer<typeof quoteBodySchema>["includedSteps"]): SourceSwapStep[] {
    const diamondToken = (token: LifiToken) =>
      this.assets.isNativeToken(token.chainId, token.address) ? zeroAddress : getAddress(token.address);
    const result: SourceSwapStep[] = [];
    for (const step of steps) {
      if (step.type === "cross") break;
      const { fromToken, toToken, fromAmount } = step.action;
      if (!fromToken || !toToken || fromAmount === undefined) continue;
      result.push({
        tool: step.tool,
        fromToken: diamondToken(fromToken),
        toToken: diamondToken(toToken),
        fromAmount: this.assets.fromLifi(BigInt(fromAmount), fromToken),
        approvalAddress: asAddress(step.estimate?.approvalAddress),
        toAmount:
          step.estimate?.toAmount === undefined ? null : this.assets.fromLifi(BigInt(step.estimate.toAmount), toToken),
        toAmountMin:
          step.estimate?.toAmountMin === undefined
            ? null
            : this.assets.fromLifi(BigInt(step.estimate.toAmountMin), toToken),
      });
    }
    return result;
  }

  /** Maps LI.FI's transfer status; never throws for an HTTP or parse error (that is `unknown`). */
  async status(ref: { tool: string; txHash: Hex; fromChainId: ChainId; toChainId: ChainId }): Promise<TransferStatus> {
    let response: { status: number; body: unknown };
    try {
      response = await this.get("status", {
        txHash: ref.txHash,
        fromChain: String(ref.fromChainId),
        toChain: String(ref.toChainId),
        bridge: ref.tool,
      });
    } catch (error) {
      return {
        state: "unknown",
        detail: `status request failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
    if (response.status !== 200) {
      const error = errorBodySchema.safeParse(response.body);
      const message = error.success ? `code ${error.data.code ?? "?"}: ${error.data.message ?? ""}` : "no body";
      return { state: "unknown", detail: `LI.FI status HTTP ${response.status} ${message}`.trim() };
    }
    const parsed = statusBodySchema.safeParse(response.body);
    if (!parsed.success) return { state: "unknown", detail: "unparseable LI.FI status" };
    const body = parsed.data;
    const sub = body.substatus
      ? `${body.substatus}: ${body.substatusMessage ?? ""}`.trim()
      : (body.substatusMessage ?? "");
    switch (body.status) {
      case "PENDING":
        return { state: "pending" };
      case "FAILED":
        return { state: "failed", reason: sub || "LI.FI reports FAILED" };
      case "DONE": {
        if (body.substatus === "REFUNDED") return { state: "failed", reason: `refunded: ${sub}` };
        const receiving = body.receiving;
        if (!receiving?.amount || !receiving.token)
          return { state: "unknown", detail: `DONE without a received amount (${sub})` };
        return {
          state: "done",
          received: this.assets.fromLifi(BigInt(receiving.amount), receiving.token),
          receivedAsset: this.assets.toAsset(receiving.token),
          receivingTxHash:
            receiving.txHash && /^0x[0-9a-fA-F]{64}$/.test(receiving.txHash) ? (receiving.txHash as Hex) : null,
        };
      }
      default:
        return { state: "unknown", detail: `LI.FI status ${body.status}${sub ? ` (${sub})` : ""}` };
    }
  }

  async tools(): Promise<{ bridges: string[]; exchanges: string[] }> {
    const { status, body } = await this.get("tools", {});
    if (status !== 200) throw new Error(`LI.FI tools failed: HTTP ${status}`);
    const parsed = z
      .object({ bridges: z.array(z.object({ key: z.string() })), exchanges: z.array(z.object({ key: z.string() })) })
      .parse(body);
    return { bridges: parsed.bridges.map((b) => b.key), exchanges: parsed.exchanges.map((e) => e.key) };
  }
}
