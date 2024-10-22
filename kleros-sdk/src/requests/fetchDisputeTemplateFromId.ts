import { request } from "graphql-request";
import { RequestError } from "../errors";

type DisputeTemplateQueryResponse = {
  disputeTemplate: {
    templateData: string;
    templateDataMappings: string;
  };
};

const fetchDisputeTemplateFromId = async (endpoint: string, id: number) => {
  const query = `
    query DisputeTemplate ($id: ID!) {
        disputeTemplate(id: $id) {
            templateData
            templateDataMappings
        }
    }
`;

  const variables = { id: id.toString() };
  try {
    return await request<DisputeTemplateQueryResponse>(endpoint, query, variables);
  } catch (error: any) {
    if (error instanceof Error) {
      throw new RequestError(`Error querying Dispute Template: ${error.message}`, endpoint);
    }
    throw new RequestError("An unknown error occurred while querying Dispute Template", endpoint);
  }
};

export default fetchDisputeTemplateFromId;
