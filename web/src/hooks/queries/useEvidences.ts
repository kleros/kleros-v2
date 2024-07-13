import { useQuery } from "@tanstack/react-query";

import { REFETCH_INTERVAL } from "consts/index";
import { useGraphqlBatcher } from "context/GraphqlBatcher";

import { graphql } from "src/graphql";
import { EvidencesQuery } from "src/graphql/graphql";
export type { EvidencesQuery };

const evidencesQuery = graphql(`
  query Evidences($evidenceGroupID: String) {
    evidences(where: { evidenceGroup: $evidenceGroupID }, orderBy: timestamp, orderDirection: desc) {
      id
      evidence
      sender {
        id
      }
      timestamp
    }
  }
`);

export const useEvidences = (evidenceGroup?: string) => {
  const isEnabled = evidenceGroup !== undefined;
  const { graphqlBatcher } = useGraphqlBatcher();

  return useQuery({
    queryKey: [`evidencesQuery${evidenceGroup}`],
    enabled: isEnabled,
    refetchInterval: REFETCH_INTERVAL,
    queryFn: async () =>
      await graphqlBatcher.fetch({
        id: crypto.randomUUID(),
        document: evidencesQuery,
        variables: { evidenceGroupID: evidenceGroup?.toString() },
      }),
  });
};
