import { useQuery } from "@tanstack/react-query";
import { useGraphqlBatcher } from "context/GraphqlBatcher";
import { graphql } from "src/graphql";
import { JurorsByCoherenceScoreQuery } from "src/graphql/graphql";

const jurorsByCoherenceScoreQuery = graphql(`
  query JurorsByCoherenceScore(
    $skip: Int
    $first: Int
    $orderBy: User_orderBy
    $orderDirection: OrderDirection
    $search: String
  ) {
    users(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: { totalResolvedVotes_gt: 0, userAddress_contains: $search }
    ) {
      id
      coherenceScore
      totalCoherentVotes
      totalResolvedVotes
      totalResolvedDisputes
    }
  }
`);

export const useJurorsByCoherenceScore = (
  skip = 0,
  first = 20,
  orderBy: string,
  orderDirection: string,
  search = ""
) => {
  const { graphqlBatcher } = useGraphqlBatcher();

  return useQuery<JurorsByCoherenceScoreQuery>({
    queryKey: ["JurorsByCoherenceScore", skip, first, orderBy, orderDirection, search],
    staleTime: Infinity,
    queryFn: async () =>
      await graphqlBatcher.fetch({
        id: crypto.randomUUID(),
        document: jurorsByCoherenceScoreQuery,
        variables: { skip, first, orderBy, orderDirection, search: search.toLowerCase() },
      }),
  });
};
