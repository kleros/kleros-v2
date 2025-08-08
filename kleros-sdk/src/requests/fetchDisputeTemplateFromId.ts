import { CombinedError, gql, type TypedDocumentNode } from "@urql/core";
import { RequestError, KlerosSDKError } from "../errors"; // Assuming KlerosSDKError as a base
import getClient from "./gqlClient";

/**
 * Represents the structure of the response for a dispute template query from the DTR subgraph.
 * @internal
 */
type DisputeTemplateQueryResponse = {
  disputeTemplate: {
    /**
     * The raw template data, typically a JSON string defining the structure and questions of the dispute.
     */
    templateData: string;
    /**
     * JSON string defining how to fetch and map additional data required by the template.
     * This can include contract calls, IPFS fetches, or subgraph queries.
     */
    templateDataMappings: string;
  } | null; // disputeTemplate can be null if not found
};

/**
 * GraphQL query to fetch a dispute template from a Dispute Template Registry (DTR) subgraph.
 * @internal
 */
const query: TypedDocumentNode<DisputeTemplateQueryResponse, { id: string }> = gql`
  query DisputeTemplate($id: ID!) {
    disputeTemplate(id: $id) {
      templateData
      templateDataMappings
    }
  }
`;

/**
 * Fetches a dispute template from a specified Dispute Template Registry (DTR) subgraph
 * based on its template ID.
 * This function is intended for internal use by the SDK, primarily by `getDispute`.
 *
 * @param {string} endpoint - The GraphQL endpoint URL of the DTR subgraph.
 * @param {number} id - The unique identifier of the dispute template.
 * @returns {Promise<DisputeTemplateQueryResponse | undefined>} A promise that resolves to the dispute template data.
 *                                                             Returns `undefined` if the query is successful but
 *                                                             yields no data (e.g., template not found).
 * @throws {CombinedError} If Urql client encounters a GraphQL error (e.g., network issues, invalid query).
 *                         This error object can contain multiple GraphQL errors.
 * @throws {RequestError} If there's a non-GraphQL error during the request or if the response
 *                        contains an error explicitly thrown by the promise chain.
 * @throws {KlerosSDKError} For other unexpected errors during the execution.
 *
 * @example
 * // Internal SDK usage:
 * // const templateId = 1;
 * // const dtrSubgraphUrl = 'https://your-dtr-subgraph-url.com/graphql';
 * // try {
 * //   const templateResponse = await fetchDisputeTemplateFromId(dtrSubgraphUrl, templateId);
 * //   if (templateResponse?.disputeTemplate) {
 * //     console.log('Template Data:', templateResponse.disputeTemplate.templateData);
 * //   } else {
 * //     console.log('Dispute template not found.');
 * //   }
 * // } catch (error) {
 * //   console.error('Failed to fetch dispute template:', error);
 * // }
 */
const fetchDisputeTemplateFromId = async (endpoint: string, id: number): Promise<DisputeTemplateQueryResponse | undefined> => {
  // Convert ID to string for GraphQL variables, as GraphQL IDs are typically strings or numbers.
  const variables = { id: id.toString() };

  try {
    const client = getClient(endpoint);
    const result = await client
      .query<DisputeTemplateQueryResponse, { id: string }>(query, variables)
      .toPromise();

    if (result.error) {
      // Let CombinedError be caught by the catch block for uniform error handling
      throw result.error;
    }
    return result.data;
  } catch (error: unknown) {
    if (error instanceof CombinedError) {
      // Re-throw to allow specific handling upstream if needed
      throw error;
    } else if (error instanceof Error) {
      // Wrap other errors in RequestError for consistent SDK error types
      throw new RequestError(`Error querying Dispute Template for ID ${id}: ${error.message}`, endpoint, { cause: error });
    }
    // Fallback for unknown error types
    throw new KlerosSDKError(`An unknown error occurred while querying Dispute Template for ID ${id}`, { cause: error });
  }
};

export default fetchDisputeTemplateFromId;
```
