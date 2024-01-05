import { parseAbiItem } from "viem";
import { AbiCallMapping } from "../utils/actionTypes";
import { createResultObject } from "../utils/createResultObject";
import { configureSDK, getPublicClient } from "../utils/configureSDK";

export const callAction = async (mapping: AbiCallMapping) => {
  configureSDK({ apiKey: process.env.ALCHEMY_API_KEY });
  const publicClient = getPublicClient();

  const { abi: source, address, args, seek, populate } = mapping;
  let parsedAbi = typeof source === "string" ? parseAbiItem(source) : source;

  const data = await publicClient.readContract({
    address: address,
    abi: [parsedAbi],
    args: args,
  });

  return createResultObject(data, seek, populate);
};
