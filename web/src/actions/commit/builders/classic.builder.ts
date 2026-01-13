import { disputeKitClassicAbi, disputeKitClassicAddress } from "hooks/contracts/generated";
import { hashVote } from "utils/crypto/hashVote";

import { ClassicCommitParams } from "../params";

import { CommitBuilder } from "./baseBuilder";

export const classicCommitBuilder: CommitBuilder<ClassicCommitParams, typeof disputeKitClassicAbi> = {
  build: async (params, context) => {
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
};
