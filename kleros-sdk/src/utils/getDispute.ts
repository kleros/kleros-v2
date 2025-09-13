import { executeActions } from "../dataMappings";
import { DisputeDetails, populateTemplate } from "../dataMappings/utils";
import { NotFoundError, KlerosSDKError } from "../errors"; // Assuming KlerosSDKError is a base error type
import fetchDisputeDetails from "../requests/fetchDisputeDetails";
import fetchDisputeTemplateFromId from "../requests/fetchDisputeTemplateFromId";
import { configureSDK, getPublicClient } from "../sdk"; // Import getPublicClient for internal checks
import { GetDisputeParameters, SdkConfig } from "../types";

/**
 * Fetches comprehensive details for a given dispute by its ID.
 * This function orchestrates calls to the Kleros Core subgraph and the Dispute Template Registry (DTR) subgraph.
 * It retrieves the core dispute data, fetches the corresponding dispute template,
 * executes any data mappings defined in the template, and then populates the template
 * with the retrieved and processed data.
 *
 * If `disputeParameters.options.sdkConfig` is provided, it will be used to configure
 * the SDK for this specific call. Otherwise, the SDK must have been previously
 * configured using `configureSDK()`.
 *
 * @param {GetDisputeParameters} disputeParameters - The parameters required to fetch the dispute.
 * @param {bigint} disputeParameters.disputeId - The unique numeric identifier of the dispute.
 * @param {string} disputeParameters.coreSubgraph - The GraphQL endpoint for the Kleros Core subgraph.
 * @param {string} disputeParameters.dtrSubgraph - The GraphQL endpoint for the Kleros DTR subgraph.
 * @param {object} [disputeParameters.options] - Optional parameters.
 * @param {SdkConfig} [disputeParameters.options.sdkConfig] - SDK configuration for this specific call.
 * @param {Record<string, any>} [disputeParameters.options.additionalContext] - Additional context for data mappings.
 *
 * @returns {Promise<DisputeDetails | undefined>} A promise that resolves to the populated dispute details.
 *                                               Returns `undefined` if the dispute or template cannot be fully processed (though typically throws errors for missing critical data).
 *
 * @throws {SdkNotConfiguredError} If the SDK is not configured (and no local `sdkConfig` is provided).
 * @throws {NotFoundError} If the dispute details or the dispute template cannot be found in their respective subgraphs.
 * @throws {KlerosSDKError} For errors during the execution of data mappings or other unexpected issues.
 *
 * @example
 * import { getDispute, configureSDK, KlerosSDKError, NotFoundError } from '@kleros/kleros-sdk';
 * import { createPublicClient, http } from 'viem';
 * import { mainnet } from 'viem/chains';
 *
 * async function main() {
 *   const client = createPublicClient({
 *     chain: mainnet,
 *     transport: http('https://rpc.ankr.com/eth'), // Replace with your RPC
 *   });
 *   configureSDK({ client });
 *
 *   const disputeId = 123n; // Use BigInt for dispute IDs
 *   const coreSubgraphUrl = 'https://api.thegraph.com/subgraphs/name/kleros/kleros-v2-core-mainnet'; // Replace with actual subgraph URL
 *   const dtrSubgraphUrl = 'https://api.thegraph.com/subgraphs/name/kleros/v2-dispute-template-registry-mainnet'; // Replace with actual subgraph URL
 *
 *   try {
 *     const dispute = await getDispute({
 *       disputeId,
 *       coreSubgraph: coreSubgraphUrl,
 *       dtrSubgraph: dtrSubgraphUrl,
 *     });
 *     console.log('Fetched Dispute:', dispute);
 *   } catch (error) {
 *     if (error instanceof NotFoundError) {
 *       console.error('Dispute or template not found:', error.message);
 *     } else if (error instanceof KlerosSDKError) {
 *       console.error('Kleros SDK error:', error.message);
 *     } else {
 *       console.error('An unexpected error occurred:', error);
 *     }
 *   }
 * }
 *
 * main();
 */
export const getDispute = async (disputeParameters: GetDisputeParameters): Promise<DisputeDetails | undefined> => {
  if (disputeParameters.options?.sdkConfig) {
    configureSDK(disputeParameters.options.sdkConfig);
  } else {
    // Ensure global SDK is configured if no local config is provided
    getPublicClient();
  }

  const { disputeId, dtrSubgraph, coreSubgraph, options } = disputeParameters;

  const disputeDetails = await fetchDisputeDetails(coreSubgraph, disputeId);

  if (!disputeDetails?.dispute) {
    throw new NotFoundError("Dispute Details", `Dispute details not found for disputeId: ${disputeId}`);
  }

  const template = await fetchDisputeTemplateFromId(dtrSubgraph, disputeDetails.dispute.templateId);

  if (!template?.disputeTemplate) { // Check specifically for disputeTemplate existence
    throw new NotFoundError(
      "Dispute Template",
      `Template not found or is malformed for template ID: ${disputeDetails.dispute.templateId}`
    );
  }

  const { templateData, templateDataMappings } = template.disputeTemplate;

  const initialContext = {
    arbitrableAddress: disputeDetails.dispute.arbitrated.id,
    arbitrableChainID: disputeDetails.dispute.arbitrableChainId,
    externalDisputeID: disputeDetails.dispute.externalDisputeId,
    ...(options?.additionalContext ?? {}), // Ensure additionalContext is an object
  };

  let data = {};
  if (templateDataMappings) {
    try {
      // Ensure templateDataMappings is valid JSON if it's a string
      const parsedMappings = typeof templateDataMappings === 'string' ? JSON.parse(templateDataMappings) : templateDataMappings;
      data = await executeActions(parsedMappings, initialContext);
    } catch (err: any) {
      // Wrap error for better context, assuming KlerosSDKError can take a cause
      throw new KlerosSDKError(`Failed to execute data mappings for dispute ${disputeId}: ${err.message}`, { cause: err });
    }
  }

  const populatedTemplate = populateTemplate(templateData, data);

  return populatedTemplate;
};
