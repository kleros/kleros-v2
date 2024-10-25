import { RequestError } from "../errors";
import { CombinedError, gql } from "@urql/core";
import getClient from "./gqlClient";

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

const fetchDisputeDetails = async (endpoint: string, id: bigint) => {
  const variables = { id: id.toString() };

  try {
    const client = getClient(endpoint);
    return client
      .query<DisputeDetailsQueryResponse>(query, variables)
      .toPromise()
      .then((res) => {
        if (res?.error) {
          throw res.error;
        }
        return res?.data;
      });
  } catch (error: unknown) {
    if (error instanceof CombinedError) {
      throw error;
    } else if (error instanceof Error) {
      throw new RequestError(`Error querying Dispute Details: ${error.message}`, endpoint);
    }
    throw new RequestError("An unknown error occurred while querying Dispute Details", endpoint);
  }
};

export default fetchDisputeDetails;
