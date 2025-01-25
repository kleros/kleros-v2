import { useQuery } from "@tanstack/react-query";

import { useGraphqlBatcher } from "context/GraphqlBatcher";
import { isUndefined } from "utils/index";

import { graphql } from "src/graphql";
import { JurorsByCoherenceScoreQuery } from "src/graphql/graphql";
export type { JurorsByCoherenceScoreQuery };

const jurorsByCoherenceScoreQuery = graphql(`
  query JurorsByCoherenceScore($skip: Int, $first: Int, $orderBy: User_orderBy, $orderDirection: OrderDirection) {
    users(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: { totalResolvedVotes_gt: 0 }
    ) {
      id
      coherenceScore
      totalCoherentVotes
      totalResolvedVotes
      totalResolvedDisputes
    }
  }
`);

export const useJurorsByCoherenceScore = (skip = 0, first = 20, orderBy: string, orderDirection: string) => {
  const isEnabled = !isUndefined(first);
  const { graphqlBatcher } = useGraphqlBatcher();

  return useQuery<JurorsByCoherenceScoreQuery>({
    queryKey: [`JurorsByCoherenceScore`, skip, first, orderBy, orderDirection],
    enabled: isEnabled,
    staleTime: Infinity,
    queryFn: async () =>
      isEnabled
        ? await graphqlBatcher.fetch({
            id: crypto.randomUUID(),
            document: jurorsByCoherenceScoreQuery,
            variables: {
              skip,
              first,
              orderBy,
              orderDirection,
            },
          })
        : undefined,
  });
};
