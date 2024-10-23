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

const fetchDisputeDetails = async (endpoint: string, id: bigint): Promise<DisputeDetailsQueryResponse> => {
  const query = `
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
  const variables = { id: id.toString() };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as any;
      throw new RequestError(
        `Error querying Dispute Details: ${errorData?.errors?.[0]?.message || "Unknown error"}`,
        endpoint
      );
    }

    const json = (await response.json()) as { data: DisputeDetailsQueryResponse };
    return json.data;
  } catch (error: any) {
    if (error instanceof Error) {
      throw new RequestError(`Error querying Dispute Details: ${error.message}`, endpoint);
    }
    throw new RequestError("An unknown error occurred while querying Dispute Details", endpoint);
  }
};

export default fetchDisputeDetails;
