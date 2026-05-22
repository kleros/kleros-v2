import {
  disputeKitGatedArgentinaConsumerProtectionAbi,
  disputeKitGatedArgentinaConsumerProtectionAddress,
} from "hooks/contracts/generated";

import { ArgentinaConsumerProtectionRevealParams } from "../params";

import { defineRevealBuilder } from "./baseBuilder";

export const argentinaConsumerProtectionRevealBuilder = defineRevealBuilder({
  build: async (params: ArgentinaConsumerProtectionRevealParams, context) => {
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
