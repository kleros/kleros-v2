import { GetTransactionReceiptReturnType, createPublicClient, decodeEventLog, getEventSelector, http } from "viem";
import * as chains from "viem/chains";

import { iArbitrableV2Abi } from "hooks/contracts/generated";
import { isUndefined } from "utils/index";

/**
 * Gets the chain object for the given chain id.
 * @param chainId - Chain id of the target EVM chain.
 * @returns Viem's chain object.
 */
const getChain = (chainId: number) => {
  for (const chain of Object.values(chains)) {
    if ("id" in chain) {
      if (chain.id === chainId) {
        return chain;
      }
    }
  }

  throw new Error(`Chain with id ${chainId} not found`);
};

// Warning  : do not import this in any pages except DisputeTemplatePreview, this has a large bundle size.
export const getDisputeRequestParamsFromTxn = async (hash: `0x${string}`, chainId: number) => {
  try {
    const publicClient = createPublicClient({
      chain: getChain(chainId),
      transport: http(),
    });

    const txn: GetTransactionReceiptReturnType = await publicClient.getTransactionReceipt({
      hash,
    });

    const selector = getEventSelector("DisputeRequest(address,uint256,uint256,uint256,string)");
    const disputeRequestEvent = txn.logs.find((log) => log.topics[0] === selector);
    if (isUndefined(disputeRequestEvent)) return undefined;

    const topics = decodeEventLog({
      abi: iArbitrableV2Abi,
      eventName: "DisputeRequest",
      topics: disputeRequestEvent?.topics,
      data: disputeRequestEvent?.data,
    });

    return {
      ...topics?.args,
      _arbitrable: disputeRequestEvent.address,
    };
  } catch (e) {
    console.log("Error getting txn :", { e });

    return undefined;
  }
};
