import { Address, concat, encodeAbiParameters, encodePacked, Hex } from "viem";

import { DisputeKits } from "./disputeKits";

interface BaseDisputeKitData {
  // required to verify if the current data is valid or not, used by NextButton, etc
  isValid: boolean | null;
}

export interface GatedDisputeKitData extends BaseDisputeKitData {
  tokenGate: Address;
  isERC1155: boolean;
  tokenId: string;
}

/**
 * Encodes gated dispute kit data
 * @param data Gated dispute kit data
 * @returns Encoded hex string
 */
const encodeGatedDisputeData = (data: GatedDisputeKitData): Hex => {
  // Packing of tokenGate and isERC1155
  // uint88 (padding 11 bytes) + bool (1 byte) + address (20 bytes) = 32 bytes

  const normalizedData = {
    ...data,
    tokenId: !data.tokenId || !data.isERC1155 ? "0" : data.tokenId,
  };

  const packed = encodePacked(["uint88", "bool", "address"], [0n, normalizedData.isERC1155, normalizedData.tokenGate]);

  return encodeAbiParameters([{ type: "bytes32" }, { type: "uint256" }], [packed, BigInt(normalizedData.tokenId)]);
};

type AssertAllKits<T extends Record<DisputeKits, unknown>> = T;

export type DisputeKitDataMap = AssertAllKits<{
  [DisputeKits.Classic]: undefined;
  [DisputeKits.Shutter]: undefined;
  [DisputeKits.Gated]: GatedDisputeKitData;
  [DisputeKits.GatedShutter]: GatedDisputeKitData;
  [DisputeKits.ArgentinaConsumerProtection]: undefined;
  [DisputeKits.ClassicUniversity]: undefined;
}>;

export const DisputeKitDataEncoder = {
  [DisputeKits.Classic]: undefined,
  [DisputeKits.Shutter]: undefined,
  [DisputeKits.Gated]: encodeGatedDisputeData,
  [DisputeKits.GatedShutter]: encodeGatedDisputeData,
  [DisputeKits.ArgentinaConsumerProtection]: undefined,
  [DisputeKits.ClassicUniversity]: undefined,
} satisfies Record<DisputeKits, unknown>;

/**
 * @param subcourtID ID  of the court the dispute will take place in
 * @param noOfVotes Number of votes the dispute will have
 * @param disputeKit Id of the dispute kit to use
 * @param disputeKitData Optional dispute kit specific data
 * @returns arbitrator extradata passed in while creating a dispute or querying costs
 */
export const prepareArbitratorExtradata = (
  subcourtID: string,
  noOfVotes: number,
  disputeKit: DisputeKits,
  disputeKitData: DisputeKitDataMap[DisputeKits]
): Hex => {
  const extraData = encodeAbiParameters(
    [{ type: "uint256" }, { type: "uint256" }, { type: "uint256" }],
    [BigInt(subcourtID), BigInt(noOfVotes), BigInt(disputeKit)]
  );

  if (!disputeKitData) {
    return extraData;
  }

  const encoder = DisputeKitDataEncoder[disputeKit];

  // if dispute kit data is provided, but dispute kit has no defined encoder, throw
  if (encoder === undefined) {
    throw new Error(`No encoder defined for Dispute Kit: ${disputeKit}`);
  }

  const encodedDisputeKitData = encoder(disputeKitData);

  return concat([extraData, encodedDisputeKitData]);
};
