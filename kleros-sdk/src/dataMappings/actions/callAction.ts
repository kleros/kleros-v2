import { parseAbiItem } from "viem";
import { AbiCallMapping } from "~src/dataMappings/utils/dataMappingTypes";
import { createResultObject } from "~src/dataMappings/utils/createResultObject";
import { configureSDK, getPublicClient } from "~src/sdk";

export const callAction = async (mapping: AbiCallMapping) => {
  configureSDK({ apiKey: process.env.ALCHEMY_API_KEY });
  const publicClient = getPublicClient();

  const { abi: source, address, args, seek, populate } = mapping;
  const parsedAbi = typeof source === "string" ? parseAbiItem(source) : source;

  const data = await publicClient.readContract({
    address,
    abi: [parsedAbi],
    args,
  });

  return createResultObject(data, seek, populate);
};
