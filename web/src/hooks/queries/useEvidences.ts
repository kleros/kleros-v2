import useSWR from "swr";
import { graphql } from "src/graphql";
import { EvidencesQuery } from "src/graphql/graphql";
export type { EvidencesQuery };

const evidencesQuery = graphql(`
  query Evidences($evidenceGroup: String) {
    evidences(where: { evidenceGroup: $evidenceGroup }, orderBy: id, orderDirection: asc) {
      id
      evidence
      sender {
        id
      }
    }
  }
`);

export const useEvidences = (evidenceGroup?: string) => {
  return useSWR<EvidencesQuery>(() =>
    typeof evidenceGroup !== "undefined"
      ? {
          query: evidencesQuery,
          variables: { evidenceGroup: evidenceGroup },
        }
      : false
  );
};
