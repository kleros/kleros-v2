import { disputeKitClassicUniversityAbi, disputeKitClassicUniversityAddress } from "hooks/contracts/generated";

import { ClassicUniversityVoteParams } from "../params";

import { defineVoteBuilder } from "./baseBuilder";

export const classicUniversityVoteBuilder = defineVoteBuilder({
  build: async (params: ClassicUniversityVoteParams, context) => {
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
