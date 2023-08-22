import { graphql } from "src/graphql";
import { EvidencesQuery } from "src/graphql/graphql";
import { useQuery } from "@tanstack/react-query";
import { graphqlQueryFnHelper } from "utils/graphqlQueryFnHelper";
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

  return useQuery({
    queryKey: ["refetchOnBlock", `evidencesQuery${evidenceGroup}`],
    enabled: isEnabled,
    queryFn: async () => await graphqlQueryFnHelper(evidencesQuery, { evidenceGroupID: evidenceGroup?.toString() }),
  });
};
