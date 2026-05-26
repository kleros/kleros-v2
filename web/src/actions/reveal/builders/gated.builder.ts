import { disputeKitGatedAbi, disputeKitGatedAddress } from "hooks/contracts/generated";

import { GatedRevealParams } from "../params";

import { defineRevealBuilder } from "./baseBuilder";

export const gatedRevealBuilder = defineRevealBuilder({
  build: async (params: GatedRevealParams, context) => {
    const { disputeId, voteIds, choice, salt, justification } = params;
    const { chain, account } = context;
    const chainKey = chain.id as keyof typeof disputeKitGatedAddress;

    return {
      account,
      address: disputeKitGatedAddress[chainKey],
      abi: disputeKitGatedAbi,
      functionName: "castVote",
      args: [disputeId, voteIds, choice, salt, justification],
      chain,
    };
  },
});
