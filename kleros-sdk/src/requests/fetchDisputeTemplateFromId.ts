import { request } from "graphql-request";

type DisputeTemplateQueryResponse = {
  disputeTemplate: {
    templateData: string;
    templateDataMappings: string;
  };
};

const fetchDisputeTemplateFromId = async (endpoint: string, id: number) => {
  const query = `
    query DisputeTemplate {
        disputeTemplate(id: ${id}) {
            templateData
            templateDataMappings
        }
    }
`;

  try {
    return await request<DisputeTemplateQueryResponse>(endpoint, query);
  } catch (error: any) {
    throw new Error(`Error querying Dispute Template Registry , endpoint : ${endpoint}, message : ${error?.message}`);
  }
};

export default fetchDisputeTemplateFromId;
