import useSWRImmutable from "swr/immutable";
import { gql } from "graphql-request";
import { CourtPolicyUriQuery } from "src/graphql/generated";
export type { CourtPolicyUriQuery };

const courtPolicyURIQuery = gql`
  query CourtPolicyURI($courtID: ID!) {
    court(id: $courtID) {
      policy
    }
  }
`;

export const useCourtPolicyURI = (id?: string | number): { data: typeof result; error: any; isValidating: boolean } => {
  const { data, error, isValidating } = useSWRImmutable(() =>
    typeof id !== "undefined"
      ? {
          query: courtPolicyURIQuery,
          variables: { courtID: id?.toString() },
        }
      : false
  );
  const result = data ? (data.court.policy as CourtPolicyUriQuery.court.policy) : undefined;
  return { data: result, error, isValidating };
};
