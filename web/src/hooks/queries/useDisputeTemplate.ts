import useSWRImmutable from "swr/immutable";
import { PublicClient } from "viem";
import { usePublicClient } from "wagmi";
import { getIArbitrableV2 } from "hooks/contracts/generated";
import { DEFAULT_CHAIN } from "consts/chains";
import { isUndefined } from "utils/index";
import { useIsCrossChainDispute } from "../useIsCrossChainDispute";

export const useDisputeTemplate = (disputeID?: string, arbitrableAddress?: `0x${string}`) => {
  const publicClient = usePublicClient();
  const { data: crossChainData } = useIsCrossChainDispute(disputeID, arbitrableAddress);
  const checkIsUndefined = !isUndefined(arbitrableAddress) && !isUndefined(disputeID) && !isUndefined(crossChainData);
  return useSWRImmutable(
    () => (checkIsUndefined ? `DisputeTemplate${disputeID}${arbitrableAddress}` : false),
    async () => {
      if (checkIsUndefined) {
        const { isCrossChainDispute, crossChainId, crossChainTemplateId, crossChainArbitrableAddress } = crossChainData;
        const templateId = isCrossChainDispute
          ? crossChainTemplateId
          : await getTemplateId(arbitrableAddress, disputeID, publicClient);
        return await getDisputeTemplate(
          templateId,
          isCrossChainDispute ? crossChainArbitrableAddress : arbitrableAddress,
          isCrossChainDispute ? parseInt(crossChainId.toString()) : DEFAULT_CHAIN,
          publicClient
        );
      } else throw Error;
    }
  );
};

const getTemplateId = async (
  arbitrableAddress: `0x${string}`,
  disputeID: string,
  publicClient: PublicClient
): Promise<bigint> => {
  const arbitrable = getIArbitrableV2({
    address: arbitrableAddress,
  });
  const disputeFilter = await arbitrable.createEventFilter.DisputeRequest(
    {
      _arbitrableDisputeID: BigInt(disputeID),
    },
    {
      fromBlock: 27808516n,
      toBlock: "latest",
    }
  );
  const disputeEvents = await publicClient.getFilterLogs({
    filter: disputeFilter,
  });
  return disputeEvents[0].args._templateId ?? 0n;
};

const getDisputeTemplate = async (
  templateId: bigint,
  arbitrableAddress: `0x${string}`,
  chainId: number,
  publicClient: PublicClient
) => {
  const arbitrable = getIArbitrableV2({
    address: arbitrableAddress,
    chainId,
  });
  const disputeTemplateFilter = await arbitrable.createEventFilter.DisputeTemplate(
    {
      _templateId: templateId,
    },
    {
      fromBlock: 0n,
      toBlock: "latest",
    }
  );
  const disputeTemplateEvents = await publicClient.getFilterLogs({
    filter: disputeTemplateFilter,
  });
  console.log(templateId, arbitrableAddress, chainId, disputeTemplateEvents);

  if (disputeTemplateEvents) {
    const parsedTemplate = JSON.parse(disputeTemplateEvents[0].args._templateData ?? "");
    return parsedTemplate;
  }
};
