import { storeCommitData } from "actions/helpers/storage";
import { getVoteKey } from "actions/helpers/storage/key";

import { disputeKitGatedAbi, disputeKitGatedAddress } from "hooks/contracts/generated";
import { hashVote } from "utils/crypto/hashVote";

import { GatedCommitParams } from "../params";

import { defineCommitBuilder } from "./baseBuilder";

export const gatedCommitBuilder = defineCommitBuilder({
  build: async (params: GatedCommitParams, context) => {
    const { disputeId, voteIds, choice, salt, roundIndex } = params;
    const { chain, account } = context;

    const key = getVoteKey(disputeId, roundIndex, voteIds);
    storeCommitData(key, { choice, salt });

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
