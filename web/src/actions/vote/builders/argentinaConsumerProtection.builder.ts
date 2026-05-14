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
    const chainKey = chain.id as keyof typeof disputeKitGatedArgentinaConsumerProtectionAddress;

    return {
      account,
      address: disputeKitGatedArgentinaConsumerProtectionAddress[chainKey],
      abi: disputeKitGatedArgentinaConsumerProtectionAbi,
      functionName: "castVote",
      args: [disputeId, voteIds, choice, salt, justification],
      chain,
    };
  },
});
