import { type GetDisputeParameters } from "src/types";
import { configureSDK } from "src/sdk";
import fetchDisputeDetails from "src/requests/fetchDisputeDetails";
import fetchDisputeTemplateFromId from "src/requests/fetchDisputeTemplateFromId";
import { executeActions } from "dataMappings/executeActions";
import { populateTemplate } from "dataMappings/utils/populateTemplate";
import { DisputeDetails } from "dataMappings/utils/disputeDetailsTypes";

/**
 * Retrieves dispute parameters based on the provided dispute ID and subgraph endpoints.
 *
 * @param {GetDisputeParameters} disputeParameters - The parameters required to get the dispute.
 * @param {number} disputeParameters.disputeId - A unique numeric identifier of the dispute in the Kleros Core contract.
 * @param {string} disputeParameters.coreSubgraph - Endpoint for the Kleros core subgraph to use.
 * @param {string} disputeParameters.dtrSubgraph - Endpoint for the Kleros dispute template registry subgraph.
 * @param {GetDisputeParametersOptions | undefined} disputeParameters.options - Optional parameters to configure the SDK and provide additional context, if not configured already.
 */
export const getDispute = async (disputeParameters: GetDisputeParameters): Promise<DisputeDetails | undefined> => {
  if (disputeParameters.options?.sdkConfig) {
    configureSDK(disputeParameters.options.sdkConfig);
  }
  const { disputeId, dtrSubgraph, coreSubgraph, options } = disputeParameters;

  const disputeDetails = await fetchDisputeDetails(coreSubgraph, disputeId);

  if (!disputeDetails || !disputeDetails.dispute) return;

  const template = await fetchDisputeTemplateFromId(dtrSubgraph, disputeDetails.dispute.templateId);

  if (!template) return;

  const { templateData, templateDataMappings } = template.disputeTemplate;

  const initialContext = {
    arbitrableAddress: disputeDetails.dispute.arbitrated.id,
    arbitrableChainID: disputeDetails.dispute.arbitrableChainId,
    externalDisputeID: disputeDetails.dispute.externalDisputeId,
    ...options?.additionalContext,
  };

  const data = templateDataMappings ? await executeActions(JSON.parse(templateDataMappings), initialContext) : {};

  const populatedTemplate = populateTemplate(templateData, data);

  return populatedTemplate;
};
