import { disputeKitGatedShutterAbi, disputeKitGatedShutterAddress } from "hooks/contracts/generated";

import { GatedShutterRevealParams } from "../params";

import { defineRevealBuilder } from "./baseBuilder";

export const gatedShutterRevealBuilder = defineRevealBuilder({
  build: async (params: GatedShutterRevealParams, context) => {
    const { disputeId, voteIds, choice, salt, justification } = params;
    const { chain, account } = context;

    return {
      account,
      address: disputeKitGatedShutterAddress[chain.id],
      abi: disputeKitGatedShutterAbi,
      functionName: "castVoteShutter",
      args: [disputeId, voteIds, choice, salt, justification],
      chain,
    };
  },
});
