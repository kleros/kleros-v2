import { getVoteKey } from "actions/helpers/storage/getVoteKey";

import { disputeKitClassicUniversityAbi, disputeKitClassicUniversityAddress } from "hooks/contracts/generated";
import { hashVote } from "utils/crypto/hashVote";

import { ClassicUniversityCommitDeps } from "../deps";
import { ClassicUniversityCommitParams } from "../params";

import { defineCommitBuilder } from "./baseBuilder";

export const classicUniversityCommitBuilder = defineCommitBuilder({
  build: async (params: ClassicUniversityCommitParams, context, deps: ClassicUniversityCommitDeps) => {
    const { disputeId, voteIds, choice, salt, roundIndex } = params;
    const { chain, account } = context;

    const key = getVoteKey(disputeId, roundIndex, voteIds);
    deps.storeCommitData(key, { choice, salt });

    const commit = hashVote(choice, salt);
    return {
      account,
      address: disputeKitClassicUniversityAddress[chain.id],
      abi: disputeKitClassicUniversityAbi,
      functionName: "castCommit",
      args: [disputeId, voteIds, commit],
      chain,
    };
  },
});
