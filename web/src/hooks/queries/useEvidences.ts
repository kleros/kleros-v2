import { graphql } from "src/graphql";
import { EvidencesQuery } from "src/graphql/graphql";
import { useQuery } from "@tanstack/react-query";
import { useGraphqlBatcher } from "context/GraphqlBatcher";
export type { EvidencesQuery };

const evidencesQuery = graphql(`
  query Evidences($evidenceGroupID: String) {
    evidences(where: { evidenceGroup: $evidenceGroupID }, orderBy: id, orderDirection: asc) {
      id
      evidence
      sender {
        id
      }
    }
  }
`);

export const useEvidences = (evidenceGroup?: string) => {
  const isEnabled = evidenceGroup !== undefined;
  const { graphqlBatcher } = useGraphqlBatcher();

  return useQuery({
    queryKey: ["refetchOnBlock", `evidencesQuery${evidenceGroup}`],
    enabled: isEnabled,
    queryFn: async () =>
      await graphqlBatcher.fetch({
        document: evidencesQuery,
        variables: { evidenceGroupID: evidenceGroup?.toString() },
      }),
  });
};
