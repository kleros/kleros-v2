import { disputeKitGatedShutterAbi, disputeKitGatedShutterAddress } from "hooks/contracts/generated";

import { GatedShutterVoteParams } from "../params";

import { defineVoteBuilder } from "./baseBuilder";

export const gatedShutterVoteBuilder = defineVoteBuilder({
  build: async (params: GatedShutterVoteParams, context) => {
    const { disputeId, voteIds, choice, salt, justification } = params;
    const { chain, account } = context;

    return {
      account,
      address: disputeKitGatedShutterAddress[chain.id],
      abi: disputeKitGatedShutterAbi,
      functionName: "castVote",
      args: [disputeId, voteIds, choice, salt, justification],
      chain,
    };
  },
});
