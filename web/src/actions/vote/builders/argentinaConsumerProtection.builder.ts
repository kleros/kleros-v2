import {
  disputeKitGatedArgentinaConsumerProtectionAbi,
  disputeKitGatedArgentinaConsumerProtectionAddress,
} from "hooks/contracts/generated";

import { ArgentinaConsumerProtectionVoteParams } from "../params";

import { defineVoteBuilder } from "./baseBuilder";

export const argentinaConsumerProtectionVoteBuilder = defineVoteBuilder({
  build: async (params: ArgentinaConsumerProtectionVoteParams, context) => {
    const { disputeId, voteIds, choice, salt, justification } = params;
    const { chain, account } = context;

    return {
      account,
      address: disputeKitGatedArgentinaConsumerProtectionAddress[chain.id],
      abi: disputeKitGatedArgentinaConsumerProtectionAbi,
      functionName: "castVote",
      args: [disputeId, voteIds, choice, salt, justification],
      chain,
    };
  },
});
