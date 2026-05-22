import { disputeKitClassicAbi, disputeKitClassicAddress } from "hooks/contracts/generated";

import { ClassicVoteParams } from "../params";

import { defineVoteBuilder } from "./baseBuilder";

export const classicVoteBuilder = defineVoteBuilder({
  build: async (params: ClassicVoteParams, context) => {
    const { disputeId, voteIds, choice, salt, justification } = params;
    const { chain, account } = context;
    const chainKey = chain.id as keyof typeof disputeKitClassicAddress;

    return {
      account,
      address: disputeKitClassicAddress[chainKey],
      abi: disputeKitClassicAbi,
      functionName: "castVote",
      args: [disputeId, voteIds, choice, salt, justification],
      chain,
    };
  },
});
