import { useQuery } from "@tanstack/react-query";

import { REFETCH_INTERVAL } from "consts/index";
import { useGraphqlBatcher } from "context/GraphqlBatcher";

import { graphql } from "src/graphql";
import { EvidenceDetailsFragment, EvidencesQuery } from "src/graphql/graphql";
export type { EvidencesQuery };

export const evidenceFragment = graphql(`
  fragment EvidenceDetails on ClassicEvidence {
    id
    evidence
    sender {
      id
    }
    timestamp
    name
    description
    fileURI
    fileTypeExtension
    evidenceIndex
  }
`);

const evidencesQuery = graphql(`
  query Evidences($evidenceGroupID: String) {
    evidences(where: { evidenceGroup: $evidenceGroupID }, orderBy: timestamp, orderDirection: asc) {
      ...EvidenceDetails
    }
  }
`);

const evidenceSearchQuery = graphql(`
  query EvidenceSearch($keywords: String!, $evidenceGroupID: String) {
    evidenceSearch(text: $keywords, where: { evidenceGroup: $evidenceGroupID }) {
      ...EvidenceDetails
    }
  }
`);

export const useEvidences = (evidenceGroup?: string, keywords?: string) => {
  const isEnabled = evidenceGroup !== undefined;
  const { graphqlBatcher } = useGraphqlBatcher();

  const document = keywords ? evidenceSearchQuery : evidencesQuery;
  return useQuery<{ evidences: EvidenceDetailsFragment[] }>({
    queryKey: [keywords ? `evidenceSearchQuery${evidenceGroup}-${keywords}` : `evidencesQuery${evidenceGroup}`],
    enabled: isEnabled,
    refetchInterval: REFETCH_INTERVAL,
    queryFn: async () => {
      const result = await graphqlBatcher.fetch({
        id: crypto.randomUUID(),
        document: document,
        variables: { evidenceGroupID: evidenceGroup?.toString(), keywords: keywords },
      });

      return keywords ? { evidences: [...result.evidenceSearch] } : result;
    },
  });
};
