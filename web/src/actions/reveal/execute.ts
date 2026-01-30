import { buildRevealTxn } from "./builders";
import type { RevealContext } from "./context";
import type { RevealParams } from "./params";

/**
 * Builds a reveal transaction and sends it to the relevant DisputeKit contract.
 *
 * Internally, this calls {@link buildRevealTxn} to construct the transaction
 * (ABI, functionName, args, etc.) and then executes it via the `walletClient`
 * provided in `context`.
 *
 * @param params  Parameters for the reveal transaction. Must include a `type` field
 *                corresponding to a `DisputeKits` value.
 * @param context Execution context, usually including chain info, account data,
 *                and a `walletClient` to send the transaction.
 *
 * @returns A promise that resolves to the transaction hash returned by `walletClient.writeContract`.
 */
export async function executeReveal(params: RevealParams, context: RevealContext) {
  const tx = await buildRevealTxn(params, context);
  const { walletClient } = context;
  return await walletClient.writeContract(tx);
}
