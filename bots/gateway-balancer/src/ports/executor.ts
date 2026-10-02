import type { Address, Hex, OperationId, TxRequest } from "../domain";

export interface SubmitOptions {
  /**
   * `op:<operationId>:step:<step>`; a repeated submit with this key resolves the existing record and never re-
   * sends.
   */
  idempotencyKey: string;
  operationId: OperationId;
  /** Overrides the chain's configured confirmations. */
  confirmations?: number;
  /** How long to wait for confirmation before returning `pending`; the platform's default otherwise. */
  waitMs?: number;
}

export type SubmitOutcome =
  | { status: "confirmed"; hash: Hex; blockNumber: bigint; gasUsed: bigint }
  | { status: "reverted"; hash: Hex; reason: string | null }
  /** Broadcast and not yet confirmed within the wait budget; call `resolve` later. */
  | { status: "pending"; hash: Hex }
  /** The nonce was consumed by another transaction. */
  | { status: "replaced"; hash: Hex; replacedByHash: Hex | null }
  /** Never broadcast (simulation or signing failed); safe to retry with a new request under the same key. */
  | { status: "failed"; error: string }
  /** Could not be determined (RPC errors, unknown hash with a consumed nonce); operator attention. */
  | { status: "unknown"; hash: Hex | null; detail: string };

export interface RecoveryReport {
  resolved: number;
  rebroadcast: number;
  /** Idempotency keys whose state could not be determined. */
  unknown: string[];
}

/**
 * Sends transactions for the single balancer EOA. Serializes nonce allocation per chain, records the signed
 * transaction in the journal before broadcasting, waits for the chain's confirmations and persists the result.
 */
export interface TxExecutor {
  readonly signer: Address;
  submit(request: TxRequest, options: SubmitOptions): Promise<SubmitOutcome>;
  /** Re-reads the chain for a recorded transaction; `undefined` for an unknown key. */
  resolve(idempotencyKey: string): Promise<SubmitOutcome | undefined>;
  /**
   * Startup: resolves every non-final record, rebroadcasts signed-but-unseen transactions whose nonce is still
   * free.
   */
  recover(): Promise<RecoveryReport>;
}
