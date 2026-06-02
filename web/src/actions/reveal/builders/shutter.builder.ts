import { disputeKitShutterAbi, disputeKitShutterAddress } from "hooks/contracts/generated";

import { ShutterRevealParams } from "../params";

import { defineRevealBuilder } from "./baseBuilder";

export const shutterRevealBuilder = defineRevealBuilder({
  build: async (params: ShutterRevealParams, context) => {
    const { disputeId, voteIds, choice, salt, justification } = params;
    const { chain, account } = context;
    const chainKey = chain.id as keyof typeof disputeKitShutterAddress;

    return {
      account,
      address: disputeKitShutterAddress[chainKey],
      abi: disputeKitShutterAbi,
      functionName: "castVoteShutter",
      args: [disputeId, voteIds, choice, salt, justification],
      chain,
    };
  },
});
