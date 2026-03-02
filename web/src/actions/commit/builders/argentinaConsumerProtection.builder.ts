import { getVoteKey } from "actions/helpers/storage/getVoteKey";

import {
  disputeKitGatedArgentinaConsumerProtectionAbi,
  disputeKitGatedArgentinaConsumerProtectionAddress,
} from "hooks/contracts/generated";
import { hashVote } from "utils/crypto/hashVote";

import { ArgentinaConsumerProtectionCommitDeps } from "../deps";
import { ArgentinaConsumerProtectionCommitParams } from "../params";

import { defineCommitBuilder } from "./baseBuilder";

export const argentinaConsumerProtectionCommitBuilder = defineCommitBuilder({
  build: async (
    params: ArgentinaConsumerProtectionCommitParams,
    context,
    deps: ArgentinaConsumerProtectionCommitDeps
  ) => {
    const { disputeId, voteIds, choice, salt, roundIndex } = params;
    const { chain, account } = context;

    const key = getVoteKey(disputeId, roundIndex, voteIds);
    deps.storeCommitData(key, { choice, salt });

    const commit = hashVote(choice, salt);
    return {
      account,
      address: disputeKitGatedArgentinaConsumerProtectionAddress[chain.id],
      abi: disputeKitGatedArgentinaConsumerProtectionAbi,
      functionName: "castCommit",
      args: [disputeId, voteIds, commit],
      chain,
    };
  },
});
