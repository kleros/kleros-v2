import { buildCommitTxn } from "./builders";
import type { CommitContext } from "./context";
import type { CommitParams } from "./params";

/**
 * @description Builds and sends a commit vote transaction to the relevant DisputeKit
 * @returns hash - hash of the transaction
 */
export async function executeCommit(params: CommitParams, context: CommitContext) {
  const tx = await buildCommitTxn(params, context);
  const { walletClient } = context;
  return await walletClient.writeContract(tx);
}
