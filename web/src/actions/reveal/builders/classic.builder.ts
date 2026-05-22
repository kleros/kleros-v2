import { disputeKitClassicAbi, disputeKitClassicAddress } from "hooks/contracts/generated";

import { ClassicRevealParams } from "../params";

import { defineRevealBuilder } from "./baseBuilder";

export const classicRevealBuilder = defineRevealBuilder({
  build: async (params: ClassicRevealParams, context) => {
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
