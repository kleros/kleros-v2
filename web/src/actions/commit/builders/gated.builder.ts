import { disputeKitGatedAbi, disputeKitGatedAddress } from "hooks/contracts/generated";
import { hashVote } from "utils/crypto/hashVote";

import { GatedCommitParams } from "../params";

import { CommitBuilder } from "./baseBuilder";

export const gatedCommitBuilder: CommitBuilder<GatedCommitParams, typeof disputeKitGatedAbi> = {
  build: async (params, context) => {
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
};
