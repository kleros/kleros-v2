import { useQuery } from "@tanstack/react-query";
import { HttpRequestError, RpcError } from "viem";

import { executeActions } from "@kleros/kleros-sdk/src/dataMappings/executeActions";
import { DisputeDetails } from "@kleros/kleros-sdk/src/dataMappings/utils/disputeDetailsTypes";
import { populateTemplate } from "@kleros/kleros-sdk/src/dataMappings/utils/populateTemplate";

import { DEFAULT_CHAIN } from "consts/chains";
import { useGraphqlBatcher } from "context/GraphqlBatcher";
import { debounceErrorToast } from "utils/debounceErrorToast";
import { isUndefined } from "utils/index";

import { graphql } from "src/graphql";

import { useDisputeDetailsQuery } from "./useDisputeDetailsQuery";

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
  const { data: disputeData } = useDisputeDetailsQuery(disputeID);
  const { graphqlBatcher } = useGraphqlBatcher();
  const isEnabled =
    !isUndefined(disputeID) &&
    !isUndefined(disputeData) &&
    !isUndefined(disputeData?.dispute) &&
    !isUndefined(disputeData.dispute?.arbitrableChainId) &&
    !isUndefined(disputeData.dispute?.externalDisputeId) &&
    !isUndefined(disputeData.dispute?.templateId);

  return useQuery<DisputeDetails>({
    queryKey: [`DisputeTemplate${disputeID}${arbitrableAddress}${disputeData?.dispute?.externalDisputeId}`],
    enabled: isEnabled,
    staleTime: Infinity,
    queryFn: async () => {
      if (isEnabled) {
        try {
          const { disputeTemplate } = await graphqlBatcher.fetch({
            id: crypto.randomUUID(),
            document: disputeTemplateQuery,
            variables: { id: disputeData.dispute?.templateId.toString() },
            isDisputeTemplate: true,
            chainId: DEFAULT_CHAIN,
          });

          const templateData = disputeTemplate?.templateData;
          const dataMappings = disputeTemplate?.templateDataMappings;

          const initialContext = {
            disputeID: disputeID,
            arbitrableAddress: arbitrableAddress,
            arbitrableChainID: disputeData.dispute?.arbitrableChainId,
            graphApiKey: import.meta.env.REACT_APP_GRAPH_API_KEY,
            alchemyApiKey: import.meta.env.ALCHEMY_API_KEY,
            externalDisputeID: disputeData.dispute?.externalDisputeId,
          };

          const data = dataMappings ? await executeActions(JSON.parse(dataMappings), initialContext) : {};
          const disputeDetails = populateTemplate(templateData, data);

          return disputeDetails;
        } catch (error) {
          if (error instanceof HttpRequestError || error instanceof RpcError) {
            debounceErrorToast("RPC failed!, Please avoid voting.");
            throw Error;
          }

          return {} as DisputeDetails;
        }
      } else throw Error;
    },
  });
};
