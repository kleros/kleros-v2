import { disputeKitShutterAbi, disputeKitShutterAddress } from "hooks/contracts/generated";

import { ShutterVoteParams } from "../params";

import { defineVoteBuilder } from "./baseBuilder";

export const shutterVoteBuilder = defineVoteBuilder({
  build: async (params: ShutterVoteParams, context) => {
    const { disputeId, voteIds, choice, salt, justification } = params;
    const { chain, account } = context;

    return {
      account,
      address: disputeKitShutterAddress[chain.id],
      abi: disputeKitShutterAbi,
      functionName: "castVote",
      args: [disputeId, voteIds, choice, salt, justification],
      chain,
    };
  },
});
