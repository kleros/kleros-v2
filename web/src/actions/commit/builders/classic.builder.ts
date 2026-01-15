import { disputeKitClassicAbi, disputeKitClassicAddress } from "hooks/contracts/generated";
import { hashVote } from "utils/crypto/hashVote";

import { ClassicCommitParams } from "../params";

import { defineCommitBuilder } from "./baseBuilder";

export const classicCommitBuilder = defineCommitBuilder({
  build: async (params: ClassicCommitParams, context) => {
    const { disputeId, voteIds, choice, salt } = params;
    const { chain, account } = context;

    const commit = hashVote(choice, salt);
    return {
      account,
      address: disputeKitClassicAddress[chain.id],
      abi: disputeKitClassicAbi,
      functionName: "castCommit",
      args: [disputeId, voteIds, commit],
      chain,
    };
  },
});
