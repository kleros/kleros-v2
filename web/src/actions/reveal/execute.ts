import { buildRevealTxn } from "./builders";
import type { RevealContext } from "./context";
import type { RevealParams } from "./params";

/**
 * @description Builds and sends a reveal vote transaction to the relevant DisputeKit
 * @returns hash - hash of the transaction
 */
export async function executeReveal(params: RevealParams, context: RevealContext) {
  const tx = await buildRevealTxn(params, context);
  const { walletClient } = context;
  return await walletClient.writeContract(tx);
}
