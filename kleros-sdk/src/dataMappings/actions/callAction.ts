import { parseAbiItem } from "viem";
import { AbiCallMapping } from "../utils/actionTypes";
import { createResultObject } from "../utils/createResultObject";
import { getPublicClient } from "../../sdk";
import { SdkNotConfiguredError } from "../../errors";

export const callAction = async (mapping: AbiCallMapping) => {
  const publicClient = getPublicClient();

  if (!publicClient) {
    throw new SdkNotConfiguredError();
  }

  const { abi: source, address, functionName, args, seek, populate } = mapping;
  const parsedAbi = typeof source === "string" ? parseAbiItem(source) : source;

  const data = await publicClient.readContract({
    address,
    abi: [parsedAbi],
    functionName,
    args,
  });

  // in case of single value returns, populate the data as {value : data}
  const sourceData = typeof data !== "object" ? { value: data } : data;

  return createResultObject(sourceData, seek, populate);
};
