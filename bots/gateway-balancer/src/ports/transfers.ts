import type { AccountingScope, Asset, ChainId, Hex, OperationId } from "../domain";
import type { RoutePurpose } from "./routing";

export interface TransferAllocation {
  scope: AccountingScope;
  amount: bigint;
}

/** Moves `amount` of `fromAsset` on `fromChainId` into `toAsset` on `toChainId`, delivered to the bot EOA. */
export interface TransferIntent {
  parentOperationId: OperationId;
  /** Distinguishes several transfers of one parent; idempotency is per (parentOperationId, tag). */
  tag: string;
  fromChainId: ChainId;
  fromAsset: Asset;
  amount: bigint;
  toChainId: ChainId;
  toAsset: Asset;
  /** Must sum to `amount`; output and realized loss are split pro-rata between the scopes. */
  allocations: TransferAllocation[];
  purpose: RoutePurpose;
}

export type TransferOutcome =
  | {
      status: "completed";
      operationId: OperationId;
      received: bigint;
      receivedByScope: TransferAllocation[];
      realizedLossBps: number;
      txHashes: Hex[];
    }
  | { status: "in-progress"; operationId: OperationId; step: string }
  /** Nothing started: no approved route, uneconomical, or over the slippage budget. */
  | { status: "deferred"; reason: string }
  | { status: "attention"; operationId: OperationId; reason: string }
  | { status: "failed"; operationId: OperationId; reason: string };

/**
 * The persisted bridge-and-swap step machine: quote, approve, send, poll status, verify receipt, unwrap.
 * Idempotent per (parentOperationId, tag): a second call resumes from the last persisted step and never
 * starts a second bridge. Holdings move eoa -> in-transit on send and in-transit -> eoa on receipt.
 */
export interface Transfers {
  run(intent: TransferIntent): Promise<TransferOutcome>;
}
