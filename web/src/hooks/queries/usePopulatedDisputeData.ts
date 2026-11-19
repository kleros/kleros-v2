import { useQuery } from "@tanstack/react-query";
import { Address, HttpRequestError, RpcError } from "viem";

import { executeActions } from "@kleros/kleros-sdk/src/dataMappings/executeActions";
import { DisputeDetails } from "@kleros/kleros-sdk/src/dataMappings/utils/disputeDetailsTypes";
import { populateTemplate } from "@kleros/kleros-sdk/src/dataMappings/utils/populateTemplate";

import { DEFAULT_CHAIN } from "consts/chains";
import { useGraphqlBatcher } from "context/GraphqlBatcher";
import { debounceErrorToast } from "utils/debounceErrorToast";
import { isUndefined } from "utils/index";

import { graphql } from "src/graphql";

import { klerosCoreAddress } from "../contracts/generated";

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

export const usePopulatedDisputeData = (disputeID?: string, arbitrableAddress?: Address) => {
  const { data: disputeData } = useDisputeDetailsQuery(disputeID);
  return useDisputeTemplateData(
    disputeID,
    arbitrableAddress,
    disputeData?.dispute?.templateId,
    disputeData?.dispute?.arbitrableChainId
  );
};

/**
 * The dispute's populated template, for callers that already know its template ID and arbitrable chain.
 * Unlike `usePopulatedDisputeData`, it doesn't subscribe to the dispute details, which refetch every few seconds.
 */
export const useDisputeTemplateData = (
  disputeID?: string,
  arbitrableAddress?: Address,
  templateId?: string | null,
  arbitrableChainId?: string | null
) => {
  const { graphqlBatcher } = useGraphqlBatcher();
  const isEnabled = !isUndefined(disputeID) && !isUndefined(arbitrableChainId) && !isUndefined(templateId);

  return useQuery<DisputeDetails>({
    queryKey: [`DisputeTemplate`, disputeID],
    enabled: isEnabled,
    staleTime: Infinity,
    queryFn: async () => {
      if (isEnabled) {
        try {
          const { disputeTemplate } = await graphqlBatcher.fetch({
            id: crypto.randomUUID(),
            document: disputeTemplateQuery,
            variables: { id: templateId.toString() },
            isDisputeTemplate: true,
            chainId: DEFAULT_CHAIN.id,
          });

          const templateData = disputeTemplate?.templateData;
          const dataMappings = disputeTemplate?.templateDataMappings;

          const initialContext = {
            // Matching the variable name to DisputeRequest
            // eslint-disable-next-line max-len
            // https://github.com/kleros/kleros-v2/blob/592243f52d57e1540206c06afdbdac0d77311106/contracts/src/arbitration/interfaces/IArbitrableV2.sol#L21
            arbitrator: klerosCoreAddress[DEFAULT_CHAIN.id],
            arbitratorDisputeID: disputeID,
            arbitrableAddress: arbitrableAddress,
            arbitrableChainID: arbitrableChainId,
            graphApiKey: import.meta.env.REACT_APP_GRAPH_API_KEY,
            alchemyApiKey: import.meta.env.ALCHEMY_API_KEY,
          };

          const data = dataMappings ? await executeActions(JSON.parse(dataMappings), initialContext) : {};
          const disputeDetails = populateTemplate(templateData, data);

          return disputeDetails;
        } catch (error) {
          console.warn({ error });
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
