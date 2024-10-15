import { request } from "graphql-request";

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

const fetchDisputeDetails = async (endpoint: string, id: number) => {
  const query = `
    query DisputeDetails {
    dispute(id: ${id}) {
        arbitrated {
            id
        }
        arbitrableChainId
        externalDisputeId
        templateId
    }
  }
`;

  try {
    return await request<DisputeDetailsQueryResponse>(endpoint, query);
  } catch (error: any) {
    throw new Error(`Error querying Dispute Details , endpoint : ${endpoint}, message : ${error?.message}`);
  }
};

export default fetchDisputeDetails;
