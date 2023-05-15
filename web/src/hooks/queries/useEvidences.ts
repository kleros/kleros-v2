import { gql } from "graphql-request";
import { EvidencesQuery } from "src/graphql/generated";
import useSWR from "swr";
export type { EvidencesQuery };

const evidencesQuery = gql`
  query Evidences($evidenceGroup: String) {
    evidences(where: { evidenceGroup: $evidenceGroup }, orderBy: id, orderDirection: asc) {
      id
      evidence
      sender {
        id
      }
    }
  }
`;

export const useEvidences = (evidenceGroup?: string): { data: typeof result; error: any; isValidating: boolean } => {
  const { data, error, isValidating } = useSWR(() =>
    typeof evidenceGroup !== "undefined"
      ? {
          query: evidencesQuery,
          variables: { evidenceGroup: evidenceGroup },
        }
      : false
  );
  const result = data ? (data as EvidencesQuery) : undefined;
  return { data: result, error, isValidating };
};
