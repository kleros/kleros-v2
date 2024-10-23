import { parseAbiItem } from "viem";
import { type AbiEvent } from "abitype";
import { AbiEventMapping } from "src/dataMappings/utils/actionTypes";
import { createResultObject } from "src/dataMappings/utils/createResultObject";
import { configureSDK, getPublicClient } from "src/sdk";

export const eventAction = async (mapping: AbiEventMapping, alchemyApiKey: string) => {
  configureSDK({ apiKey: alchemyApiKey });
  const publicClient = getPublicClient();

  const { abi: source, address, eventFilter, seek, populate } = mapping;
  const parsedAbi = parseAbiItem(source) as AbiEvent;

  const filter = await publicClient.createEventFilter({
    address,
    event: parsedAbi,
    args: eventFilter.args,
    fromBlock: eventFilter.fromBlock ? BigInt(eventFilter.fromBlock.toString()) : undefined,
    toBlock: eventFilter.toBlock ? BigInt(eventFilter.toBlock.toString()) : undefined,
  });

  const contractEvent = await publicClient.getFilterLogs({ filter });
  const eventData = contractEvent[0].args;

  return createResultObject(eventData, seek, populate);
};
