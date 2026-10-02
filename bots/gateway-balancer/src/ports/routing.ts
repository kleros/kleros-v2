import type { Address, Asset, ChainId, Hex, TxRequest } from "../domain";

export type RoutePurpose = "refill" | "reporter";

export interface RouteRequest {
  fromChainId: ChainId;
  fromAsset: Asset;
  toChainId: ChainId;
  toAsset: Asset;
  amount: bigint;
  sender: Address;
  /** Always the bot EOA: route output is verified and allocated before any deposit. */
  recipient: Address;
  purpose: RoutePurpose;
  /** The operation-level, fee-normalized minimum output when the caller has a price baseline. */
  minimumOutput?: bigint;
}

export type RouteStepKind = "approve" | "swap" | "bridge" | "cross";

export interface RouteStep {
  kind: RouteStepKind;
  chainId: ChainId;
  /** The underlying tool (bridge or exchange) LI.FI chose; must be allowlisted. */
  tool: string;
  target: Address;
  spender?: Address;
  /** Bounded to the step's input; never unlimited. */
  approvalAmount?: bigint;
  tx: TxRequest;
}

export interface RouteQuote {
  id: string;
  tool: string;
  fromChainId: ChainId;
  toChainId: ChainId;
  fromAsset: Asset;
  toAsset: Asset;
  inputAmount: bigint;
  estimatedOutput: bigint;
  minimumOutput: bigint;
  /** Quoted fees in output-asset units, for the fee-normalized budget comparison. */
  feeCostsInOutput: bigint;
  gasCostsNative: bigint;
  steps: RouteStep[];
  /** The destination asset arrives wrapped (WETH) and must be unwrapped before any deposit. */
  deliversWrapped: boolean;
  expiresAt: Date | null;
  raw: unknown;
}

export type QuoteResult =
  | { kind: "quote"; quote: RouteQuote }
  | { kind: "no-route"; reason: string }
  /** A route exists but fails the signing policy (allowlist, limits, slippage budget). */
  | { kind: "rejected"; violations: string[]; quote?: RouteQuote };

export type TransferStatus =
  | { state: "pending" }
  | { state: "done"; received: bigint; receivedAsset: Asset | null; receivingTxHash: Hex | null }
  | { state: "failed"; reason: string }
  | { state: "unknown"; detail: string };

/** LI.FI quotes and transfer status, with the transaction policy applied to every quote. */
export interface RouteProvider {
  quote(request: RouteRequest): Promise<QuoteResult>;
  status(ref: { tool: string; txHash: Hex; fromChainId: ChainId; toChainId: ChainId }): Promise<TransferStatus>;
}
