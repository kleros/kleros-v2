import { generateSalt } from "utils/crypto/generateSalt";

import { restoreCommitData } from "../helpers/storage";
import { getVoteKey } from "../helpers/storage/getVoteKey";

import { bruteForceChoice } from "./helpers/bruteForceChoice";
import { ResolveRevealContext, ResolveRevealParams, RevealParams } from "./params";

/**
 * Resolves all inputs required for a Reveal Action builder.
 *
 * This function ensures that `salt`, `choice`, and `justification` are available,
 * either by retrieving them from local storage or by regenerating them if missing.
 *
 * Behavior:
 * 1. Attempts to restore stored commit data for the given dispute, round, and vote IDs.
 * 2. Uses the provided `justification` if present, else falls back to stored value, else empty string.
 * 3. If no stored data is found:
 *    - Regenerates the salt using `generateSalt` and a signing account.
 *    - Recovers the original vote `choice` by brute-forcing against the commit using `bruteForceChoice`.
 *
 * @param params  Parameters for resolving reveal, including disputeId, roundIndex, voteIds, and optional justification.
 * @param context Execution context including signing account, answers array, commit hash, and helper functions.
 *
 * @returns Fully populated {@link RevealParams} containing:
 * - `salt` as a `bigint`
 * - `choice` as a `bigint`
 * - `justification` as a string
 *
 * @throws Will throw an error if:
 * - Salt regeneration is required but no signing account is available.
 * - Choice cannot be recovered due to missing answers or commit.
 */
export async function resolveRevealInputs(
  params: ResolveRevealParams,
  context: ResolveRevealContext
): Promise<RevealParams> {
  const key = getVoteKey(params.disputeId, params.roundIndex, params.voteIds);
  const stored = restoreCommitData(key);

  const justification = params.justification ?? stored?.justification ?? "";

  if (stored) return { ...params, ...stored, justification };

  // regenerate salt
  if (!context.signingAccount && !context.generateSigningAccount) {
    throw new Error("Cannot regenerate salt: no signing account available");
  }

  const signingAccount = context.signingAccount ?? (await context.generateSigningAccount!());

  if (!signingAccount) {
    throw new Error("Cannot regenerate salt: unable to generate signing account.");
  }
  const salt = await generateSalt(signingAccount, key);

  if (!context.answers || !context.commit) {
    throw new Error("Cannot retrieve choice: answers and commit not available");
  }

  const choice = bruteForceChoice(salt, context.answers, context.commit);

  return {
    ...params,
    salt: BigInt(salt),
    choice,
    justification,
  };
}
