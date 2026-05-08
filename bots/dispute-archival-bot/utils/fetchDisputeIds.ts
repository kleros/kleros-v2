import { getEnvConfig } from "../config.ts";
import type { GraphQLResponse } from "./types.ts";

type DisputesResponse = {
  disputes: Array<{
    id: string;
  }>;
};

const query = `
  query Disputes {
    disputes(first: 1000) {
        id
    }
  }
`;

export async function fetchDisputeIds() {
  const config = getEnvConfig();

  const response = await fetch(config.coreSubgraphUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
    }),
  });

  if (!response.ok) {
    throw new Error("fetchDisputeIds: fetch request failed.");
  }

  const json = (await response.json()) as GraphQLResponse<DisputesResponse>;

  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }

  if (!json.data) {
    throw new Error("fetchDisputeIds: fetch request did not return any data.");
  }

  return json.data.disputes.flatMap((dispute) => dispute.id);
}
