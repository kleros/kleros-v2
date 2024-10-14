import { request } from "graphql-request";

type DisputeTemplateQueryResponse = {
  disputeTemplate: {
    templateData: string;
    templateDataMappings: string;
  };
};

const fetchDisputeTemplateFromId = (endpoint: string, id: number) => {
  const query = `
    query DisputeTemplate {
        disputeTemplate(id: ${id}) {
            templateData
            templateDataMappings
        }
    }
`;

  try {
    return request<DisputeTemplateQueryResponse>(endpoint, query)
      .then((res) => res)
      .catch((err) => {
        throw new Error(`Error querying Dispute Template Registry , endpoint : ${endpoint}, message : ${err?.message}`);
      });
  } catch (error: any) {
    console.log(`Query Error : ${error?.message}`);
    return undefined;
  }
};

export default fetchDisputeTemplateFromId;
