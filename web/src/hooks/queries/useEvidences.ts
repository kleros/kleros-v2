import { useQuery } from "@tanstack/react-query";

import { REFETCH_INTERVAL } from "consts/index";
import { DEFAULT_CHAIN } from "consts/chains";
import { useGraphqlBatcher } from "context/GraphqlBatcher";
import { transformSearch } from "utils/transformSearch";

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
    transactionHash
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
  const transformedKeywords = transformSearch(keywords);

  return useQuery<{ evidences: EvidenceDetailsFragment[] }>({
    queryKey: [keywords ? `evidenceSearchQuery${evidenceGroup}-${keywords}` : `evidencesQuery${evidenceGroup}`],
    enabled: isEnabled,
    refetchInterval: REFETCH_INTERVAL,
    queryFn: async () => {
      const result = await graphqlBatcher.fetch({
        id: crypto.randomUUID(),
        document: document,
        chainId: DEFAULT_CHAIN,
        variables: { evidenceGroupID: evidenceGroup?.toString(), keywords: transformedKeywords },
      });

      return keywords ? { evidences: [...result.evidenceSearch] } : result;
    },
  });
};
