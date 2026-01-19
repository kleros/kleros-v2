import { buildVoteTxn } from "./builders";
import type { VoteContext } from "./context";
import type { VoteParams } from "./params";

/**
 * @description Builds and sends a vote transaction to the relevant DisputeKit
 * @returns hash - hash of the transaction
 */
export async function executeVote(params: VoteParams, context: VoteContext) {
  const tx = await buildVoteTxn(params, context);
  const { walletClient } = context;
  return await walletClient.writeContract(tx);
}
