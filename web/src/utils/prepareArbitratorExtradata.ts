import { ethers } from "ethers";

import { IDisputeKitData, IGatedDisputeData, ISomeFutureDisputeData } from "context/NewDisputeContext";

/**
 * Encodes gated dispute kit data
 * @param data Gated dispute kit data
 * @returns Encoded hex string
 */
const encodeGatedDisputeData = (data: IGatedDisputeData): string => {
  // Packing of tokenGate and isERC1155
  // uint88 (padding 11 bytes) + bool (1 byte) + address (20 bytes) = 32 bytes
  const packed = ethers.utils.solidityPack(["uint88", "bool", "address"], [0, data.isERC1155, data.tokenGate]);
  if (!data.tokenId || !data.isERC1155) data.tokenId = "0";
  return ethers.utils.defaultAbiCoder.encode(["bytes32", "uint256"], [packed, data.tokenId]);
};

/**
 * Encodes future dispute kit data
 * @param data Future dispute kit data
 * @returns Encoded hex string
 */
const encodeFutureDisputeData = (data: ISomeFutureDisputeData): string => {
  return ethers.utils.defaultAbiCoder.encode(["address"], [data.contract]);
};

/**
 * Registry of encoding functions for different dispute kit data types
 */
const disputeKitDataEncoders = {
  gated: encodeGatedDisputeData,
  future: encodeFutureDisputeData,
} as const;

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
  disputeKit: number = 1,
  disputeKitData?: IDisputeKitData
) => {
  let extraData = ethers.utils.defaultAbiCoder.encode(
    ["uint256", "uint256", "uint256"],
    [subcourtID, noOfVotes, disputeKit]
  ) as `0x{string}`;
  if (!disputeKitData) {
    return extraData;
  }

  const encoder = disputeKitDataEncoders[disputeKitData.type];
  if (!encoder) {
    throw new Error(`Unknown dispute kit data type: ${disputeKitData.type}`);
  }
  const encodedDisputeKitData = encoder(disputeKitData as any);
  extraData = ethers.utils.hexConcat([extraData, encodedDisputeKitData]) as `0x{string}`;
  return extraData;
};
