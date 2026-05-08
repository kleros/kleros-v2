import type { Address, Hash } from "viem";
import { getEnvConfig } from "../config.ts";
import type { GraphQLResponse } from "./types.ts";

export type Evidence = {
  id: string;
  evidence: string;
  senderAddress: Address;
  sender?: { id: string };
  evidenceIndex: string;
  timestamp: string;
  transactionHash: Hash;
  name?: string;
  description?: string;
  fileURI?: string;
  fileTypeExtension?: string;
};

type EvidencesResponse = {
  evidences: Evidence[];
};

// NOTE: externalDisputeId was removed in the updated contracts, this is beta kleros core specific
const query = `
  query Evidences($evidenceGroupID: String) {
    evidences(where: { evidenceGroup: $evidenceGroupID }, orderBy: timestamp, orderDirection: asc, first: 1000) {
        id
        evidence
        senderAddress
        sender {
          id
        }
        evidenceIndex
        timestamp
        transactionHash
        name
        description
        fileURI
        fileTypeExtension
    }
  }
`;

export async function fetchDisputeEvidences(externalDisputeId: string) {
  const config = getEnvConfig();

  const variables = {
    evidenceGroupID: externalDisputeId,
  };

  const response = await fetch(config.coreSubgraphUrl, {
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
    throw new Error("fetchDisputeEvidences: fetch request failed.");
  }

  const json = (await response.json()) as GraphQLResponse<EvidencesResponse>;

  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }

  if (!json.data) {
    throw new Error("fetchDisputeEvidences: fetch request did not return any data.");
  }

  return json.data.evidences;
}
