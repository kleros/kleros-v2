import { disputeKitClassicAbi, disputeKitClassicAddress } from "hooks/contracts/generated";

import { ClassicVoteParams } from "../params";

import { defineVoteBuilder } from "./baseBuilder";

export const classicVoteBuilder = defineVoteBuilder({
  build: async (params: ClassicVoteParams, context) => {
    const { disputeId, voteIds, choice, salt, justification } = params;
    const { chain, account } = context;

    return {
      account,
      address: disputeKitClassicAddress[chain.id],
      abi: disputeKitClassicAbi,
      functionName: "castVote",
      args: [disputeId, voteIds, choice, salt, justification],
      chain,
    };
  },
});
