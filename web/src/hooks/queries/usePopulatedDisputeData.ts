import { useQuery } from "@tanstack/react-query";
import { graphql } from "src/graphql";
import { PublicClient } from "viem";
import { usePublicClient } from "wagmi";
import { getIArbitrableV2 } from "hooks/contracts/generated";
import { isUndefined } from "utils/index";
import { graphqlQueryFnHelper } from "utils/graphqlQueryFnHelper";
import { useIsCrossChainDispute } from "../useIsCrossChainDispute";
import { GENESIS_BLOCK_ARBSEPOLIA } from "consts/index";
import { populateTemplate } from "@kleros/kleros-sdk/src/dataMappings/utils/populateTemplate";
import { executeActions } from "@kleros/kleros-sdk/src/dataMappings/executeActions";
import { DisputeDetails } from "@kleros/kleros-sdk/src/dataMappings/utils/disputeDetailsTypes";

const disputeTemplateQuery = graphql(`
  query DisputeTemplate($id: ID!) {
    disputeTemplate(id: $id) {
      id
      templateTag
      templateData
      templateDataMappings
    }
  }
`);

export const usePopulatedDisputeData = (disputeID?: string, arbitrableAddress?: `0x${string}`) => {
  const publicClient = usePublicClient();
  const { data: crossChainData } = useIsCrossChainDispute(disputeID, arbitrableAddress);
  const isEnabled = !isUndefined(disputeID) && !isUndefined(crossChainData) && !isUndefined(arbitrableAddress);
  return useQuery<DisputeDetails>({
    queryKey: [`DisputeTemplate${disputeID}${arbitrableAddress}`],
    enabled: isEnabled,
    staleTime: Infinity,
    queryFn: async () => {
      if (isEnabled) {
        try {
          const { isCrossChainDispute, crossChainTemplateId } = crossChainData;
          const templateId = isCrossChainDispute
            ? crossChainTemplateId
            : await getTemplateId(arbitrableAddress, disputeID, publicClient);

          const { disputeTemplate } = await graphqlQueryFnHelper(
            disputeTemplateQuery,
            { id: templateId.toString() },
            true
          );
          const templateData = disputeTemplate?.templateData;
          const dataMappings = disputeTemplate?.templateDataMappings;

          const initialContext = {
            disputeID: disputeID,
            arbitrable: arbitrableAddress,
          };

          const data = dataMappings ? await executeActions(JSON.parse(dataMappings), initialContext) : {};
          const disputeDetails = populateTemplate(templateData, data);

          return disputeDetails;
        } catch {
          return {} as DisputeDetails;
        }
      } else throw Error;
    },
  });
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
      fromBlock: GENESIS_BLOCK_ARBSEPOLIA,
      toBlock: "latest",
    }
  );
  const disputeEvents = await publicClient.getFilterLogs({
    filter: disputeFilter,
  });
  return disputeEvents[0].args._templateId ?? 0n;
};
