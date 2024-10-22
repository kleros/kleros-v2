import { request, gql } from "graphql-request";
import { RequestError } from "../errors";

type DisputeDetailsQueryResponse = {
  dispute: {
    arbitrated: {
      id: string;
    };
    arbitrableChainId: number;
    externalDisputeId: number;
    templateId: number;
  };
};

const fetchDisputeDetails = async (endpoint: string, id: bigint) => {
  const query = gql`
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
  const variables = { id: Number(id) };

  try {
    return await request<DisputeDetailsQueryResponse>(endpoint, query, variables);
  } catch (error: any) {
    if (error instanceof Error) {
      throw new RequestError(`Error querying Dispute Details: ${error.message}`, endpoint);
    }
    throw new RequestError("An unknown error occurred while querying Dispute Details", endpoint);
  }
};

export default fetchDisputeDetails;
