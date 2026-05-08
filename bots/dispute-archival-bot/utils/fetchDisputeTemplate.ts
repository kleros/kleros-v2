import { getEnvConfig } from "../config.ts";
import type { GraphQLResponse } from "./types.ts";

export type DisputeTemplate = {
  id: string;
  templateTag?: string;
  templateData: string;
  templateDataMappings: string;
};

type DisputeTemplateResponse = {
  disputeTemplate: DisputeTemplate;
};

const query = `
 query DisputeTemplate($id: ID!) {
    disputeTemplate(id: $id) {
      id
      templateTag
      templateData
      templateDataMappings
    }
  }
`;

export async function fetchDisputeTemplate(templateId: string) {
  const config = getEnvConfig();

  const variables = {
    id: templateId,
  };

  const response = await fetch(config.dtrSubgraphUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error("fetchDisputeTemplate: fetch request failed.");
  }

  const json = (await response.json()) as GraphQLResponse<DisputeTemplateResponse>;

  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }

  if (!json.data) {
    throw new Error("fetchDisputeTemplate: fetch request did not return any data.");
  }

  return json.data.disputeTemplate;
}
