import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { getIHomeGateway } from "hooks/contracts/generated";
import { isUndefined } from "utils/index";
import { GENESIS_BLOCK_ARBSEPOLIA } from "src/consts";
import { debounceErrorToast } from "utils/debounceErrorToast";
import { HttpRequestError } from "viem";

interface IIsCrossChainDispute {
  isCrossChainDispute: boolean;
  crossChainId: bigint;
  crossChainTemplateId: bigint;
  crossChainArbitrableAddress: `0x${string}`;
}

export const useIsCrossChainDispute = (disputeID?: string, arbitrableAddress?: `0x${string}`) => {
  const isEnabled = !isUndefined(arbitrableAddress) && !isUndefined(disputeID);
  const publicClient = usePublicClient();
  return useQuery<IIsCrossChainDispute | undefined>({
    queryKey: [`IsCrossChainDispute${disputeID}`],
    enabled: isEnabled,
    staleTime: Infinity,
    queryFn: async () => {
      if (isEnabled) {
        try {
          const arbitrable = getIHomeGateway({
            address: arbitrableAddress,
          });
          const crossChainDisputeFilter = await arbitrable.createEventFilter.CrossChainDisputeIncoming(
            {
              _arbitratorDisputeID: BigInt(disputeID),
            },
            {
              fromBlock: GENESIS_BLOCK_ARBSEPOLIA,
              toBlock: "latest",
            }
          );
          const crossChainDisputeEvents = await publicClient.getFilterLogs({
            filter: crossChainDisputeFilter,
          });

          if (crossChainDisputeEvents.length > 0) {
            return {
              isCrossChainDispute: true,
              crossChainId: crossChainDisputeEvents[0].args._arbitrableChainId ?? 0n,
              crossChainTemplateId: crossChainDisputeEvents[0].args._templateId ?? 0n,
              crossChainArbitrableAddress: crossChainDisputeEvents[0].args._arbitrable ?? "0x",
            };
          } else {
            return {
              isCrossChainDispute: false,
              crossChainId: 0n,
              crossChainTemplateId: 0n,
              crossChainArbitrableAddress: "0x",
            };
          }
        } catch (error: any) {
          if (error instanceof HttpRequestError) {
            debounceErrorToast("RPC failed!, Please avoid voting.");
          }
          throw Error;
        }
      } else throw Error;
    },
  });
};
