import { graphql } from "src/graphql";
import { EvidencesQuery } from "src/graphql/graphql";
import { useSWRBlock } from "hooks/useSWRBlock";
import { isUndefined } from "utils/index";
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
  return useSWRBlock<EvidencesQuery>(() =>
    !isUndefined(evidenceGroup)
      ? {
          query: evidencesQuery,
          variables: { evidenceGroupID: evidenceGroup },
        }
      : false
  );
};
