import { getVoteKey } from "actions/helpers/storage/getVoteKey";

import { disputeKitGatedAbi, disputeKitGatedAddress } from "hooks/contracts/generated";
import { hashVote } from "utils/crypto/hashVote";

import { GatedCommitDeps } from "../deps";
import { GatedCommitParams } from "../params";

import { defineCommitBuilder } from "./baseBuilder";

export const gatedCommitBuilder = defineCommitBuilder({
  build: async (params: GatedCommitParams, context, deps: GatedCommitDeps) => {
    const { disputeId, voteIds, choice, salt, roundIndex } = params;
    const { chain, account } = context;

    const key = getVoteKey(disputeId, roundIndex, voteIds);
    deps.storeCommitData(key, { choice, salt });

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
