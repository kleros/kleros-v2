import { CombinedError, gql } from "@urql/core";
import { RequestError } from "../errors";
import getClient from "./gqlClient";

type DisputeTemplateQueryResponse = {
  disputeTemplate: {
    templateData: string;
    templateDataMappings: string;
  };
};
const query = gql`
  query DisputeTemplate($id: ID!) {
    disputeTemplate(id: $id) {
      templateData
      templateDataMappings
    }
  }
`;

const fetchDisputeTemplateFromId = async (endpoint: string, id: number) => {
  const variables = { id: id.toString() };

  try {
    const client = getClient(endpoint);
    return client
      .query<DisputeTemplateQueryResponse>(query, variables)
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
      throw new RequestError(`Error querying Dispute Template: ${error.message}`, endpoint);
    }
    throw new RequestError("An unknown error occurred while querying Dispute Template", endpoint);
  }
};

export default fetchDisputeTemplateFromId;
