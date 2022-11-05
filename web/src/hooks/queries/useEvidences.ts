import useSWR from "swr";
import { gql } from "graphql-request";
import { EvidencesQuery } from "src/graphql/generated";
export type { EvidencesQuery };

const evidencesQuery = gql`
  query Evidences($evidenceGroup: String) {
    evidences(
      where: { evidenceGroup: $evidenceGroup }
      orderBy: id
      orderDirection: asc
    ) {
      id
      evidence
      sender
    }
  }
`;

export const useEvidences = (evidenceGroup?: string) => {
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
