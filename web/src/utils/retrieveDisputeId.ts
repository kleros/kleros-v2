import { decodeEventLog, getAbiItem, Log, Address, toEventSelector } from "viem";

import { DEFAULT_CHAIN } from "consts/chains";
import { klerosCoreAbi, klerosCoreAddress } from "hooks/contracts/generated";

/**
 * Extracts the dispute ID from DisputeCreation event emitted by Kleros core.
 *
 * @param logs - Logs array from dispute transaction receipt
 * @param coreAddress - kleros core address (optional)
 * @returns The dispute ID if found, otherwise `undefined`
 * @todo Write unit test
 */
export function retrieveDisputeIdFromLogs(
  logs: readonly Log[],
  coreAddress: Address = klerosCoreAddress[DEFAULT_CHAIN.id]
) {
  const eventAbi = getAbiItem({
    abi: klerosCoreAbi,
    name: "DisputeCreation",
  });

  const disputeCreationEventTopic = toEventSelector(eventAbi);

  const log = logs.find(
    (l) => l.address.toLowerCase() === coreAddress.toLowerCase() && l.topics[0] === disputeCreationEventTopic
  );

  if (!log) return undefined;

  const { args } = decodeEventLog({
    abi: [eventAbi],
    data: log.data,
    topics: log.topics,
  });

  return args._disputeID;
}
