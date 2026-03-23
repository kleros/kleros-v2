import { Hex } from "viem";

import { Answer } from "@kleros/kleros-sdk";

import { Bytes32Hash, hashVote } from "utils/crypto/hashVote";
/**
 * Attempts to recover a user's original vote choice from a salted commit.
 *
 * This function "brute-forces" the choice by hashing each candidate answer
 * with the provided salt and comparing it against the given commit.
 * If the commit matches one of the candidates, the corresponding choice ID is returned.
 *
 * When a dispute has no answers, a default "Refuse To Arbitrate" answer is added
 * so that even empty disputes can be checked.
 *
 * @param salt    The deterministic salt used in the original commit
 * @param answers Array of possible answers in the dispute. See {@link Answer}
 * @param commit  The hexadecimal commit string to compare against.
 *
 * @returns The `id` of the matching answer (as a bigint) if found.
 *
 * @throws Will throw an error if no matching choice is found.
 */
export const bruteForceChoice = (salt: Hex, answers: Answer[], commit: Bytes32Hash) => {
  // when dispute is invalid, just add RFA to the answers array
  const candidates =
    answers?.length > 0
      ? answers
      : [{ id: "0x0", title: "Refuse To Arbitrate", description: "Refuse To Arbitrate" } as Answer];

  const { found, choice } = candidates.reduce<{ found: boolean; choice: bigint }>(
    (acc, answer) => {
      if (acc.found) return acc;

      const innerCommit = hashVote(BigInt(answer.id), BigInt(salt));

      return innerCommit === commit ? { found: true, choice: BigInt(answer.id) } : acc;
    },
    { found: false, choice: BigInt(-1) }
  );

  if (!found) {
    throw new Error("Unable to retrieve choice.");
  }

  return choice;
};
