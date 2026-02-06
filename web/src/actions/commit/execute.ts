import { buildCommitTxn } from "./builders";
import type { CommitContext } from "./context";
import type { CommitParams } from "./params";

/**
 * Builds a commit transaction and sends it to the relevant DisputeKit contract.
 *
 * @param params  Parameters for the commit transaction. Must include a `type` field
 *                corresponding to a `DisputeKits` value.
 * @param context Execution context, usually including chain info, account data,
 *                and a `walletClient` to send the transaction.
 *
 * @returns The transaction hash.
 *
 * @dev Internally, this calls {@link buildCommitTxn} to construct the transaction
 * (ABI, functionName, args, etc.) and then executes it via the `walletClient`
 * provided in `context`.
 */
export async function executeCommit(params: CommitParams, context: CommitContext) {
  const tx = await buildCommitTxn(params, context);
  const { walletClient } = context;
  return await walletClient.writeContract(tx);
}
