import { RequestError } from "../errors";

type DisputeTemplateQueryResponse = {
  disputeTemplate: {
    templateData: string;
    templateDataMappings: string;
  };
};

const fetchDisputeTemplateFromId = async (endpoint: string, id: number): Promise<DisputeTemplateQueryResponse> => {
  const query = `
    query DisputeTemplate($id: ID!) {
      disputeTemplate(id: $id) {
        templateData
        templateDataMappings
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
        `Error querying Dispute Template: ${errorData?.errors?.[0]?.message || "Unknown error"}`,
        endpoint
      );
    }

    const json = (await response.json()) as { data: DisputeTemplateQueryResponse };
    return json.data;
  } catch (error: any) {
    if (error instanceof Error) {
      throw new RequestError(`Error querying Dispute Template: ${error.message}`, endpoint);
    }
    throw new RequestError("An unknown error occurred while querying Dispute Template", endpoint);
  }
};

export default fetchDisputeTemplateFromId;
