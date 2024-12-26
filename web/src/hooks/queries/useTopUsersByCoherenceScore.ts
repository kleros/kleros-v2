import { useQuery } from "@tanstack/react-query";

import { useGraphqlBatcher } from "context/GraphqlBatcher";
import { DEFAULT_CHAIN } from "consts/chains";
import { isUndefined } from "utils/index";

import { graphql } from "src/graphql";
import { TopUsersByCoherenceScoreQuery } from "src/graphql/graphql";
export type { TopUsersByCoherenceScoreQuery };

const topUsersByCoherenceScoreQuery = graphql(`
  query TopUsersByCoherenceScore($first: Int!, $orderBy: User_orderBy, $orderDirection: OrderDirection) {
    users(first: $first, orderBy: $orderBy, orderDirection: $orderDirection) {
      id
      coherenceScore
      totalCoherentVotes
      totalResolvedVotes
      totalResolvedDisputes
    }
  }
`);

export const useTopUsersByCoherenceScore = (first = 5) => {
  const isEnabled = !isUndefined(first);
  const { graphqlBatcher } = useGraphqlBatcher();

  return useQuery<TopUsersByCoherenceScoreQuery>({
    queryKey: [`TopUsersByCoherenceScore${first}`],
    enabled: isEnabled,
    staleTime: Infinity,
    queryFn: async () =>
      isEnabled
        ? await graphqlBatcher.fetch({
            id: crypto.randomUUID(),
            document: topUsersByCoherenceScoreQuery,
            chainId: DEFAULT_CHAIN,
            variables: {
              first: first,
              orderBy: "coherenceScore",
              orderDirection: "desc",
            },
          })
        : undefined,
  });
};
