import { useQuery } from "@tanstack/react-query";
import { graphql } from "src/graphql";
import { useGraphqlBatcher } from "context/GraphqlBatcher";
import { CourtPolicyUriQuery } from "src/graphql/graphql";
import { isUndefined } from "utils/index";
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
  const { graphqlBatcher } = useGraphqlBatcher();

  return useQuery<CourtPolicyUriQuery>({
    queryKey: [`CourtPolicyURI${id}`],
    enabled: isEnabled,
    staleTime: Infinity,
    queryFn: async () =>
      isEnabled
        ? await graphqlBatcher.fetch({ document: courtPolicyURIQuery, variables: { courtID: id.toString() } })
        : undefined,
  });
};
