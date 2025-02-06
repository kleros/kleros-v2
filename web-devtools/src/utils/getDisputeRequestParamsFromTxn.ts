import { getPublicClient } from "@wagmi/core";
import { type GetTransactionReceiptReturnType, decodeEventLog, getEventSelector } from "viem";

import { wagmiAdapter } from "context/Web3Provider";
import { iArbitrableV2Abi } from "hooks/contracts/generated";
import { isUndefined } from "utils/isUndefined";

export const getDisputeRequestParamsFromTxn = async (hash: `0x${string}`, chainId: number) => {
  try {
    const publicClient = getPublicClient(wagmiAdapter.wagmiConfig, { chainId });
    if (!publicClient) return;
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
    console.error(e);
    return undefined;
  }
};
