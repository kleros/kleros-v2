import { useQuery } from "@tanstack/react-query";
import { graphql } from "src/graphql";
import { graphqlQueryFnHelper } from "utils/graphqlQueryFnHelper";
import { TopUsersByCoherenceScoreQuery } from "src/graphql/graphql";
import { isUndefined } from "utils/index";
export type { TopUsersByCoherenceScoreQuery };

const topUsersByCoherenceScoreQuery = graphql(`
  query TopUsersByCoherenceScore($first: Int!, $orderBy: User_orderBy, $orderDirection: OrderDirection) {
    users(first: $first, orderBy: $orderBy, orderDirection: $orderDirection) {
      id
      coherenceScore
      totalCoherent
      totalResolvedDisputes
    }
  }
`);

export const useTopUsersByCoherenceScore = (first = 5) => {
  const isEnabled = !isUndefined(first);

  return useQuery<TopUsersByCoherenceScoreQuery>({
    queryKey: [`TopUsersByCoherenceScore${first}`],
    enabled: isEnabled,
    staleTime: Infinity,
    queryFn: async () =>
      isEnabled
        ? await graphqlQueryFnHelper(topUsersByCoherenceScoreQuery, {
            first: first,
            orderBy: "coherenceScore",
            orderDirection: "desc",
          })
        : undefined,
  });
};
