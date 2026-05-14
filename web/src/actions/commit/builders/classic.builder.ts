import { getVoteKey } from "actions/helpers/storage/getVoteKey";

import { disputeKitClassicAbi, disputeKitClassicAddress } from "hooks/contracts/generated";
import { hashVote } from "utils/crypto/hashVote";

import { ClassicCommitDeps } from "../deps";
import { ClassicCommitParams } from "../params";

import { defineCommitBuilder } from "./baseBuilder";

export const classicCommitBuilder = defineCommitBuilder({
  build: async (params: ClassicCommitParams, context, deps: ClassicCommitDeps) => {
    const { disputeId, voteIds, choice, salt, roundIndex } = params;
    const { chain, account } = context;

    const key = getVoteKey(disputeId, roundIndex, voteIds);
    deps.storeCommitData(key, { choice, salt });

    const commit = hashVote(choice, salt);
    const chainKey = chain.id as keyof typeof disputeKitClassicAddress;

    return {
      account,
      address: disputeKitClassicAddress[chainKey],
      abi: disputeKitClassicAbi,
      functionName: "castCommit",
      args: [disputeId, voteIds, commit],
      chain,
    };
  },
});
