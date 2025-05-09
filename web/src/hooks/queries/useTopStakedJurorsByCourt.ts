import { useQuery } from "@tanstack/react-query";
import { useGraphqlBatcher } from "context/GraphqlBatcher";
import { graphql } from "src/graphql";
import { TopStakedJurorsByCourtQuery, OrderDirection } from "src/graphql/graphql";

const topStakedJurorsByCourtQuery = graphql(`
  query TopStakedJurorsByCourt(
    $courtId: ID!
    $skip: Int
    $first: Int
    $orderBy: JurorTokensPerCourt_orderBy
    $orderDirection: OrderDirection
    $search: String
  ) {
    jurorTokensPerCourts(
      where: { court_: { id: $courtId }, effectiveStake_gt: 0, juror_: { userAddress_contains_nocase: $search } }
      skip: $skip
      first: $first
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      court {
        id
      }
      juror {
        id
        userAddress
      }
      effectiveStake
    }
  }
`);

export const useTopStakedJurorsByCourt = (
  courtId: string,
  skip: number,
  first: number,
  orderBy: string,
  orderDirection: OrderDirection,
  search = ""
) => {
  const { graphqlBatcher } = useGraphqlBatcher();
  return useQuery<TopStakedJurorsByCourtQuery>({
    queryKey: ["JurorsByCoherenceScore", courtId, skip, first, orderBy, orderDirection, search],
    staleTime: Infinity,
    queryFn: () =>
      graphqlBatcher.fetch({
        id: crypto.randomUUID(),
        document: topStakedJurorsByCourtQuery,
        variables: {
          courtId,
          skip,
          first,
          orderBy,
          orderDirection,
          search: search.toLowerCase(),
        },
      }),
  });
};
