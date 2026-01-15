import { disputeKitGatedAbi, disputeKitGatedAddress } from "hooks/contracts/generated";
import { hashVote } from "utils/crypto/hashVote";

import { GatedCommitParams } from "../params";

import { defineCommitBuilder } from "./baseBuilder";

export const gatedCommitBuilder = defineCommitBuilder({
  build: async (params: GatedCommitParams, context) => {
    const { disputeId, voteIds, choice, salt } = params;
    const { chain, account } = context;

    const commit = hashVote(choice, salt);
    return {
      account,
      address: disputeKitGatedAddress[chain.id],
      abi: disputeKitGatedAbi,
      functionName: "castCommit",
      args: [disputeId, voteIds, commit],
      chain,
    };
  },
});
