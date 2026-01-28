import { generateSalt } from "utils/crypto/generateSalt";

import { restoreCommitData } from "../helpers/storage";
import { getVoteKey } from "../helpers/storage/key";

import { bruteForceChoice } from "./helpers/bruteForceChoice";
import { ResolveRevealContext, ResolveRevealParams, RevealParams } from "./params";

/**
 * @description Injects salt, choice and justification, generates in case those are absent from local storage
 * @returns Defined inputs for Reveal Action builder.
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

  const choice = await bruteForceChoice(salt, context.answers, context.commit);

  return {
    ...params,
    salt: BigInt(salt),
    choice,
    justification,
  };
}
