import { useQuery } from "@tanstack/react-query";

import { useGraphqlBatcher } from "context/GraphqlBatcher";
import { DEFAULT_CHAIN } from "consts/chains";
import { isUndefined } from "utils/index";

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
  const isEnabled = !isUndefined(id);
  const { graphqlBatcher } = useGraphqlBatcher();

  return useQuery<CourtPolicyUriQuery>({
    queryKey: [`CourtPolicyURI${id}`],
    enabled: isEnabled,
    staleTime: Infinity,
    queryFn: async () =>
      isEnabled
        ? await graphqlBatcher.fetch({
            id: crypto.randomUUID(),
            document: courtPolicyURIQuery,
            chainId: DEFAULT_CHAIN,
            variables: { courtID: id.toString() },
          })
        : undefined,
  });
};
