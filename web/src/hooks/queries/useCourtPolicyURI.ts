import useSWRImmutable from "swr/immutable";
import { graphql } from "src/graphql";
import { CourtPolicyUriQuery } from "src/graphql/graphql";
export type { CourtPolicyUriQuery };

const courtPolicyURIQuery = graphql(`
  query CourtPolicyURI($courtID: ID!) {
    court(id: $courtID) {
      policy
    }
  }
`);

export const useCourtPolicyURI = (id?: string | number) => {
  return useSWRImmutable<CourtPolicyUriQuery>(() =>
    typeof id !== "undefined"
      ? {
          query: courtPolicyURIQuery,
          variables: { courtID: id?.toString() },
        }
      : false
  );
};
