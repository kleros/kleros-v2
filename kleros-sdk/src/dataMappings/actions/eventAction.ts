import { parseAbiItem } from "viem";
import { type AbiEvent } from "abitype";
import { AbiEventMapping } from "src/dataMappings/utils/actionTypes";
import { createResultObject } from "src/dataMappings/utils/createResultObject";
import { getPublicClient } from "src/sdk";

export const eventAction = async (mapping: AbiEventMapping) => {
  const publicClient = getPublicClient();

  if (!publicClient) {
    throw new Error("SDK not configured. Please call `configureSDK` before using.");
  }

  const { abi: source, address, eventFilter, seek, populate } = mapping;
  const parsedAbi = parseAbiItem(source) as AbiEvent;

  const filter = await publicClient.createEventFilter({
    address,
    event: parsedAbi,
    args: eventFilter.args,
    fromBlock: eventFilter.fromBlock,
    toBlock: eventFilter.toBlock,
  });

  const contractEvent = await publicClient.getFilterLogs({ filter });
  const eventData = contractEvent[0].args;

  return createResultObject(eventData, seek, populate);
};
