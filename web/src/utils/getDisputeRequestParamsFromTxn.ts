import { GetTransactionReceiptReturnType, decodeEventLog, getEventSelector } from "viem";
import { getPublicClient } from "wagmi/dist/actions";

import { iArbitrableV2ABI } from "hooks/contracts/generated";

import { isUndefined } from ".";

export const getDisputeRequestParamsFromTxn = async (hash: `0x${string}`, chainId: number) => {
  try {
    const publicClient = getPublicClient({ chainId });

    const txn: GetTransactionReceiptReturnType = await publicClient.getTransactionReceipt({
      hash,
    });

    const selector = getEventSelector("DisputeRequest(address,uint256,uint256,uint256,string)");
    const disputeRequestEvent = txn.logs.find((log) => log.topics[0] === selector);
    if (isUndefined(disputeRequestEvent)) return undefined;

    const topics = decodeEventLog({
      abi: iArbitrableV2ABI,
      eventName: "DisputeRequest",
      topics: disputeRequestEvent?.topics,
      data: disputeRequestEvent?.data,
    });

    return {
      ...topics?.args,
      _arbitrable: disputeRequestEvent.address,
    };
  } catch (e) {
    return undefined;
  }
};
