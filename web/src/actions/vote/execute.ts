import { buildVoteTxn } from "./builders";
import type { VoteContext } from "./context";
import type { VoteParams } from "./params";

/**
 * Builds a vote transaction and sends it to the relevant DisputeKit contract.
 *
 * @param params  Parameters for the vote transaction. Must include a `type` field
 *                corresponding to a `DisputeKits` value.
 * @param context Execution context, usually including chain info, account data,
 *                and a `walletClient` to send the transaction.
 *
 * @returns The transaction hash.
 *
 * @dev Internally, this calls {@link buildVoteTxn} to construct the transaction
 * (ABI, functionName, args, etc.) and then executes it via the `walletClient`
 * provided in `context`.
 */
export async function executeVote(params: VoteParams, context: VoteContext) {
  const tx = await buildVoteTxn(params, context);
  const { walletClient } = context;
  return walletClient.writeContract(tx);
}
