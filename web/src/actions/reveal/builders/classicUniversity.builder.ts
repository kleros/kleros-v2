import { disputeKitClassicUniversityAbi, disputeKitClassicUniversityAddress } from "hooks/contracts/generated";

import { ClassicUniversityRevealParams } from "../params";

import { defineRevealBuilder } from "./baseBuilder";

export const classicUniversityRevealBuilder = defineRevealBuilder({
  build: async (params: ClassicUniversityRevealParams, context) => {
    const { disputeId, voteIds, choice, salt, justification } = params;
    const { chain, account } = context;
    const chainKey = chain.id as keyof typeof disputeKitClassicUniversityAddress;

    return {
      account,
      address: disputeKitClassicUniversityAddress[chainKey],
      abi: disputeKitClassicUniversityAbi,
      functionName: "castVote",
      args: [disputeId, voteIds, choice, salt, justification],
      chain,
    };
  },
});
