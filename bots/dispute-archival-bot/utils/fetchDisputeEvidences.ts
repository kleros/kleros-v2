import type { Address, Hash } from "viem";

import { paginatedSubgraphQuery } from "./query";

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

// NOTE: externalDisputeId was removed in the updated contracts, this is beta kleros core specific
const evidencesQuery = `
  query Evidences($evidenceGroupID: String!, $first: Int!, $skip: Int!) {
    evidences(
      where: { evidenceGroup: $evidenceGroupID }
      orderBy: timestamp
      orderDirection: asc
      first: $first
      skip: $skip
    ) {
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
  return paginatedSubgraphQuery<Evidence>("fetchDisputeEvidences", evidencesQuery, "evidences", {
    evidenceGroupID: externalDisputeId,
  });
}
