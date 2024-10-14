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

const fetchDisputeDetails = (endpoint: string, id: number) => {
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
    return request<DisputeDetailsQueryResponse>(endpoint, query)
      .then((res) => res)
      .catch((err) => {
        throw new Error(`Error querying Dispute Details , endpoint : ${endpoint}, message : ${err?.message}`);
      });
  } catch (error: any) {
    console.log(`Query Error : ${error?.message}`);
    return undefined;
  }
};

export default fetchDisputeDetails;
