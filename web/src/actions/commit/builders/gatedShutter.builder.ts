import { Hex } from "viem";

import { getVoteKey } from "actions/helpers/storage/getVoteKey";

import { disputeKitGatedShutterAbi, disputeKitGatedShutterAddress } from "hooks/contracts/generated";
import { hashJustification } from "utils/crypto/hashJustification";
import { hashVote } from "utils/crypto/hashVote";
import { encrypt } from "utils/crypto/shutter";

import { GatedShutterCommitDeps } from "../deps";
import { encodeShutterMessage } from "../helpers";
import { GatedShutterCommitParams } from "../params";

import { defineCommitBuilder } from "./baseBuilder";

export const gatedShutterCommitBuilder = defineCommitBuilder({
  builderDeps: {
    encrypt,
  },
  build: async (params: GatedShutterCommitParams, context, deps: GatedShutterCommitDeps) => {
    if (!import.meta.env.REACT_APP_SHUTTER_API || import.meta.env.REACT_APP_SHUTTER_API.trim() === "") {
      console.error("REACT_APP_SHUTTER_API environment variable is not set or is empty");
      throw new Error("Cannot commit vote: REACT_APP_SHUTTER_API environment variable is required but not set");
    }

    const { disputeId, voteIds, choice, salt, decryptionDelay, justification, roundIndex } = params;
    const { chain, account } = context;

    const key = getVoteKey(disputeId, roundIndex, voteIds);
    deps.storeCommitData(key, { choice, salt, justification });

    const encodedMessage = encodeShutterMessage(choice, salt, justification);

    const { encryptedCommitment, identity } = await deps.encrypt(encodedMessage, decryptionDelay);

    const choiceCommit = hashVote(choice, salt);
    const justificationCommit = hashJustification(salt, justification);
    const chainKey = chain.id as keyof typeof disputeKitGatedShutterAddress;

    return {
      account,
      address: disputeKitGatedShutterAddress[chainKey],
      abi: disputeKitGatedShutterAbi,
      functionName: "castCommitShutter",
      args: [disputeId, voteIds, choiceCommit, justificationCommit, identity as Hex, encryptedCommitment],
      chain,
    };
  },
});
