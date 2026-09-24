import { useQuery } from "@tanstack/react-query";

import { REFETCH_INTERVAL } from "consts/index";
import { useGraphqlBatcher } from "context/GraphqlBatcher";
import { transformSearch } from "utils/transformSearch";

import { graphql } from "src/graphql";
import { EvidenceDetailsFragment, EvidencesQuery } from "src/graphql/graphql";

export type { EvidencesQuery };

import { isUndefined } from "src/utils";

import { DisputeArchiveSnapshot, useDisputeArchiveSnapshot } from "./useDisputeArchiveSnapshot";

export const evidenceFragment = graphql(`
  fragment EvidenceDetails on ClassicEvidence {
    id
    evidence
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
`);

const evidencesQuery = graphql(`
  query Evidences($disputeID: String) {
    evidences(where: { dispute: $disputeID }, orderBy: timestamp, orderDirection: asc) {
      ...EvidenceDetails
    }
  }
`);

const evidenceSearchQuery = graphql(`
  query EvidenceSearch($keywords: String!, $disputeID: String) {
    evidenceSearch(text: $keywords, where: { dispute: $disputeID }) {
      ...EvidenceDetails
    }
  }
`);

export const useEvidences = (disputeID?: string, keywords?: string) => {
  const { data: archivedData, isLoading: isLoadingArchivedData } = useDisputeArchiveSnapshot(disputeID);

  const isEnabled = !isUndefined(disputeID) && !isLoadingArchivedData;
  const { graphqlBatcher } = useGraphqlBatcher();

  const document = keywords ? evidenceSearchQuery : evidencesQuery;
  const transformedKeywords = transformSearch(keywords);

  return useQuery<{ evidences: EvidenceDetailsFragment[] }>({
    queryKey: keywords ? [`EvidenceSearchQuery`, disputeID, keywords] : [`EvidencesQuery`, disputeID],
    enabled: isEnabled,
    refetchInterval: REFETCH_INTERVAL,
    queryFn: async () => {
      if (!isUndefined(archivedData?.evidences)) {
        const evidences = archivedData.evidences;
        const filtered = keywords
          ? evidences.filter((evidence) => searchArchiveEvidence(evidence, keywords))
          : evidences;
        return { evidences: filtered };
      }

      const result = await graphqlBatcher.fetch({
        id: crypto.randomUUID(),
        document: document,
        variables: { disputeID, keywords: transformedKeywords },
      });

      return keywords ? { evidences: [...result.evidenceSearch] } : result;
    },
  });
};

function searchArchiveEvidence(evidence: NonNullable<DisputeArchiveSnapshot["evidences"]>[number], keywords: string) {
  const normalized = keywords.trim().toLowerCase();
  if (normalized.length === 0) {
    return true;
  }
  // joining the searchable keys and looking for keyword to be a sub-string of this
  const combinedSearchString = [evidence.name, evidence.description, evidence.evidence]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return normalized
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => combinedSearchString.includes(word));
}
