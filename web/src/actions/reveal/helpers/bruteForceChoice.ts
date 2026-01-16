import { encodePacked, Hex, keccak256 } from "viem";

import { Answer } from "@kleros/kleros-sdk";

/**
 * @description Recovers choice by brute forcing
 * @returns User's original choice
 */
export const bruteForceChoice = async (salt: Hex, answers: Answer[], commit: string) => {
  // when dispute is invalid, just add RFA to the answers array
  const candidates =
    answers?.length > 0
      ? answers
      : [{ id: "0x0", title: "Refuse To Arbitrate", description: "Refuse To Arbitrate" } as Answer];

  const { found, choice } = candidates.reduce<{ found: boolean; choice: bigint }>(
    (acc, answer) => {
      if (acc.found) return acc;
      const innerCommit = keccak256(encodePacked(["uint256", "uint256"], [BigInt(answer.id), BigInt(salt)]));
      if (innerCommit === commit) {
        return { found: true, choice: BigInt(answer.id) };
      } else return acc;
    },
    { found: false, choice: BigInt(-1) }
  );

  if (!found) {
    throw new Error("Unable to retrieve choice.");
  }

  return choice;
};
