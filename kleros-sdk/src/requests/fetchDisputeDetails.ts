import { RequestError, KlerosSDKError } from "../errors"; // Assuming KlerosSDKError as a base
import { CombinedError, gql, type TypedDocumentNode } from "@urql/core";
import getClient from "./gqlClient";

/**
 * Represents the structure of the response for a dispute details query.
 * @internal
 */
type DisputeDetailsQueryResponse = {
  dispute: {
    /** The address of the arbitrable contract involved in the dispute. */
    arbitrated: {
      id: string;
    };
    /** The chain ID where the arbitrable contract resides. */
    arbitrableChainId: number;
    /** The identifier of the dispute within the context of the arbitrable contract. */
    externalDisputeId: number;
    /** The identifier of the dispute template associated with this dispute. */
    templateId: number;
  } | null; // Dispute can be null if not found
};

/**
 * GraphQL query to fetch core details of a dispute from a Kleros Core subgraph.
 * @internal
 */
const query: TypedDocumentNode<DisputeDetailsQueryResponse, { id: string }> = gql`
  query DisputeDetails($id: ID!) {
    dispute(id: $id) {
      arbitrated {
        id
      }
      arbitrableChainId
      externalDisputeId
      templateId
    }
  }
`;

/**
 * Fetches core details of a dispute from a specified Kleros Core subgraph.
 * This function is intended for internal use by the SDK, typically called by higher-level
 * functions like `getDispute`.
 *
 * @param {string} endpoint - The GraphQL endpoint URL of the Kleros Core subgraph.
 * @param {bigint} id - The unique identifier of the dispute (as a BigInt).
 * @returns {Promise<DisputeDetailsQueryResponse | undefined>} A promise that resolves to the dispute details
 *                                                           from the subgraph. Returns `undefined` if the
 *                                                           query is successful but yields no data.
 * @throws {CombinedError} If Urql client encounters a GraphQL error (e.g., network issues, invalid query).
 *                         This error object can contain multiple GraphQL errors.
 * @throws {RequestError} If there's a non-GraphQL error during the request or if the response
 *                        contains an error explicitly thrown by the promise chain.
 * @throws {KlerosSDKError} For other unexpected errors during the execution.
 *
 * @example
 * // Internal SDK usage:
 * // const disputeId = 123n;
 * // const coreSubgraphUrl = 'https://your-core-subgraph-url.com/graphql';
 * // try {
 * //   const details = await fetchDisputeDetails(coreSubgraphUrl, disputeId);
 * //   if (details?.dispute) {
 * //     console.log('Arbitrated contract:', details.dispute.arbitrated.id);
 * //   } else {
 * //     console.log('Dispute not found.');
 * //   }
 * // } catch (error) {
 * //   console.error('Failed to fetch dispute details:', error);
 * // }
 */
const fetchDisputeDetails = async (endpoint: string, id: bigint): Promise<DisputeDetailsQueryResponse | undefined> => {
  const variables = { id: id.toString() };

  try {
    const client = getClient(endpoint);
    const result = await client
      .query<DisputeDetailsQueryResponse, { id: string }>(query, variables)
      .toPromise();

    if (result.error) {
      // Let CombinedError be caught by the catch block for uniform error handling
      throw result.error;
    }
    return result.data;
  } catch (error: unknown) {
    if (error instanceof CombinedError) {
      // Re-throw to allow specific handling upstream if needed, or wrap if preferred
      throw error;
    } else if (error instanceof Error) {
      // Wrap other errors in RequestError for consistent SDK error types
      throw new RequestError(`Error querying Dispute Details for ID ${id}: ${error.message}`, endpoint, { cause: error });
    }
    // Fallback for unknown error types
    throw new KlerosSDKError(`An unknown error occurred while querying Dispute Details for ID ${id}`, { cause: error });
  }
};

export default fetchDisputeDetails;
```
