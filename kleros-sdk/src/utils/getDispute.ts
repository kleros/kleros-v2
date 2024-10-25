import { executeActions } from "../dataMappings";
import { DisputeDetails, populateTemplate } from "../dataMappings/utils";
import { NotFoundError } from "../errors";
import fetchDisputeDetails from "../requests/fetchDisputeDetails";
import fetchDisputeTemplateFromId from "../requests/fetchDisputeTemplateFromId";
import { configureSDK } from "../sdk";
import { GetDisputeParameters } from "../types";

/**
 * Retrieves dispute parameters based on the provided dispute ID and subgraph endpoints.
 *
 * @param {GetDisputeParameters} disputeParameters - The parameters required to get the dispute.
 * @param {bigint} disputeParameters.disputeId - A unique numeric identifier of the dispute in the Kleros Core contract.
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

  if (!disputeDetails?.dispute) {
    throw new NotFoundError("Dispute Details", `Dispute details not found for disputeId: ${disputeId}`);
  }

  const template = await fetchDisputeTemplateFromId(dtrSubgraph, disputeDetails.dispute.templateId);

  if (!template) {
    throw new NotFoundError(
      "Dispute Template",
      `Template not found for template ID: ${disputeDetails.dispute.templateId}`
    );
  }

  const { templateData, templateDataMappings } = template.disputeTemplate;

  const initialContext = {
    arbitrableAddress: disputeDetails.dispute.arbitrated.id,
    arbitrableChainID: disputeDetails.dispute.arbitrableChainId,
    externalDisputeID: disputeDetails.dispute.externalDisputeId,
    ...options?.additionalContext,
  };

  let data = {};
  if (templateDataMappings) {
    try {
      data = await executeActions(JSON.parse(templateDataMappings), initialContext);
    } catch (err: any) {
      throw err;
    }
  }

  const populatedTemplate = populateTemplate(templateData, data);

  return populatedTemplate;
};
