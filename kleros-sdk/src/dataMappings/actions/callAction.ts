import { parseAbiItem } from "viem";
import { AbiCallMapping } from "../utils/actionTypes";
import { createResultObject } from "../utils/createResultObject";
import { getPublicClient } from "../../sdk";

export const callAction = async (mapping: AbiCallMapping) => {
  const publicClient = getPublicClient();

  if (!publicClient) {
    throw new Error("SDK not configured. Please call `configureSDK` before using.");
  }

  const { abi: source, address, functionName, args, seek, populate } = mapping;
  const parsedAbi = typeof source === "string" ? parseAbiItem(source) : source;

  const data = await publicClient.readContract({
    address,
    abi: [parsedAbi],
    functionName,
    args,
  });

  return createResultObject(data, seek, populate);
};
