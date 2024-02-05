import { GetTransactionReceiptReturnType, decodeEventLog } from "viem";
import { getPublicClient } from "wagmi/dist/actions";
import { iArbitrableV2ABI } from "hooks/contracts/generated";

export const getDisputeRequestParamsFromTxn = async (hash: `0x${string}`, chainId: number) => {
  try {
    const publicClient = getPublicClient({ chainId });

    const txn: GetTransactionReceiptReturnType = await publicClient.getTransactionReceipt({
      hash,
    });

    const topics = decodeEventLog({
      abi: iArbitrableV2ABI,
      eventName: "DisputeRequest",
      topics: txn.logs[2].topics,
      data: txn.logs[2].data,
    });

    return {
      ...topics?.args,
      _arbitrable: txn.logs[2].address,
    };
  } catch (e) {
    console.log("getDisputeRequestParamsFromTxn :", e);
    return undefined;
  }
};
