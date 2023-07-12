import { useQuery } from "@tanstack/react-query";
import { graphql } from "src/graphql";
import { graphqlQueryFnHelper } from "utils/graphqlQueryFnHelper";
import { CourtPolicyUriQuery } from "src/graphql/graphql";
import { isUndefined } from "swr/_internal";
export type { CourtPolicyUriQuery };

const courtPolicyURIQuery = graphql(`
  query CourtPolicyURI($courtID: ID!) {
    court(id: $courtID) {
      policy
    }
  }
`);

export const useCourtPolicyURI = (id?: string | number) => {
  const isEnabled = !isUndefined(id);

  return useQuery<CourtPolicyUriQuery>({
    queryKey: [`CourtPolicyURI${id}`],
    enabled: isEnabled,
    staleTime: Infinity,
    queryFn: async () =>
      isEnabled ? await graphqlQueryFnHelper(courtPolicyURIQuery, { courtID: id.toString() }) : undefined,
  });
};
