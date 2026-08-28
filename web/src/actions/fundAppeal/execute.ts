import { buildFundAppealTxn } from "./builders";
import type { FundAppealContext } from "./context";
import type { FundAppealParams } from "./params";

/**
 * Builds a fund appeal transaction and sends it to the relevant DisputeKit contract.
 *
 * @param params  Parameters for the fund appeal transaction. Must include a `disputeKitId` field
 *                corresponding to a `DisputeKits` value.
 * @param context Execution context, usually including chain info, account data,
 *                and a `walletClient` to send the transaction.
 *
 * @returns The transaction hash.
 *
 * @dev Internally, this calls {@link buildFundAppealTxn} to construct the transaction
 * (ABI, functionName, args, etc.) and then executes it via the `walletClient`
 * provided in `context`.
 */
export async function executeFundAppeal(params: FundAppealParams, context: FundAppealContext) {
  const tx = await buildFundAppealTxn(params, context);
  const { walletClient } = context;
  return walletClient.writeContract(tx);
}
