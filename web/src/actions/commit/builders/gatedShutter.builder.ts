import { Hex } from "viem";

import { disputeKitGatedShutterAbi, disputeKitGatedShutterAddress } from "hooks/contracts/generated";
import { hashJustification } from "utils/crypto/hashJustification";
import { hashVote } from "utils/crypto/hashVote";
import { encrypt } from "utils/crypto/shutter";

import { encodeShutterMessage } from "../helpers";
import { GatedShutterCommitParams } from "../params";

import { defineCommitBuilder } from "./baseBuilder";

export const gatedShutterCommitBuilder = defineCommitBuilder({
  build: async (params: GatedShutterCommitParams, context) => {
    if (!import.meta.env.REACT_APP_SHUTTER_API || import.meta.env.REACT_APP_SHUTTER_API.trim() === "") {
      console.error("REACT_APP_SHUTTER_API environment variable is not set or is empty");
      throw new Error("Cannot commit vote: REACT_APP_SHUTTER_API environment variable is required but not set");
    }

    const { disputeId, voteIds, choice, salt, decryptionDelay, justification } = params;
    const { chain, account } = context;

    const encodedMessage = encodeShutterMessage(choice, salt, justification);

    const { encryptedCommitment, identity } = await encrypt(encodedMessage, decryptionDelay);

    const choiceCommit = hashVote(choice, BigInt(salt));
    const justificationCommit = hashJustification(BigInt(salt), justification);

    return {
      account,
      address: disputeKitGatedShutterAddress[chain.id],
      abi: disputeKitGatedShutterAbi,
      functionName: "castCommitShutter",
      args: [disputeId, voteIds, choiceCommit, justificationCommit, identity as Hex, encryptedCommitment],
      chain,
    };
  },
});
