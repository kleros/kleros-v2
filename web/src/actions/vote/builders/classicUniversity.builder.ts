import { disputeKitClassicUniversityAbi, disputeKitClassicUniversityAddress } from "hooks/contracts/generated";

import { ClassicUniversityVoteParams } from "../params";

import { defineVoteBuilder } from "./baseBuilder";

export const classicUniversityVoteBuilder = defineVoteBuilder({
  build: async (params: ClassicUniversityVoteParams, context) => {
    const { disputeId, voteIds, choice, salt, justification } = params;
    const { chain, account } = context;

    return {
      account,
      address: disputeKitClassicUniversityAddress[chain.id],
      abi: disputeKitClassicUniversityAbi,
      functionName: "castVote",
      args: [disputeId, voteIds, choice, salt, justification],
      chain,
    };
  },
});
