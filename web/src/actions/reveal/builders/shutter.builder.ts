import { disputeKitShutterAbi, disputeKitShutterAddress } from "hooks/contracts/generated";

import { ShutterRevealParams } from "../params";

import { defineRevealBuilder } from "./baseBuilder";

export const shutterRevealBuilder = defineRevealBuilder({
  build: async (params: ShutterRevealParams, context) => {
    const { disputeId, voteIds, choice, salt, justification } = params;
    const { chain, account } = context;

    return {
      account,
      address: disputeKitShutterAddress[chain.id],
      abi: disputeKitShutterAbi,
      functionName: "castVoteShutter",
      args: [disputeId, voteIds, choice, salt, justification],
      chain,
    };
  },
});
