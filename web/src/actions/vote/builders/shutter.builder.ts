import { disputeKitShutterAbi, disputeKitShutterAddress } from "hooks/contracts/generated";

import { ShutterVoteParams } from "../params";

import { defineVoteBuilder } from "./baseBuilder";

export const shutterVoteBuilder = defineVoteBuilder({
  build: async (params: ShutterVoteParams, context) => {
    const { disputeId, voteIds, choice, salt, justification } = params;
    const { chain, account } = context;
    const chainKey = chain.id as keyof typeof disputeKitShutterAddress;

    return {
      account,
      address: disputeKitShutterAddress[chainKey],
      abi: disputeKitShutterAbi,
      functionName: "castVote",
      args: [disputeId, voteIds, choice, salt, justification],
      chain,
    };
  },
});
