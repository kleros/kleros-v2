import { disputeKitGatedAbi, disputeKitGatedAddress } from "hooks/contracts/generated";

import { GatedVoteParams } from "../params";

import { defineVoteBuilder } from "./baseBuilder";

export const gatedVoteBuilder = defineVoteBuilder({
  build: async (params: GatedVoteParams, context) => {
    const { disputeId, voteIds, choice, salt, justification } = params;
    const { chain, account } = context;

    return {
      account,
      address: disputeKitGatedAddress[chain.id],
      abi: disputeKitGatedAbi,
      functionName: "castVote",
      args: [disputeId, voteIds, choice, salt, justification],
      chain,
    };
  },
});
