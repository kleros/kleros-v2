import { useQuery } from "@tanstack/react-query";

import { useGraphqlBatcher } from "context/GraphqlBatcher";

import { graphql } from "src/graphql";
import { TotalLeaderboardJurorsQuery } from "src/graphql/graphql";
export type { TotalLeaderboardJurorsQuery };

const totalLeaderboardJurorsQuery = graphql(`
  query TotalLeaderboardJurors($id: ID!) {
    counter(id: $id) {
      totalLeaderboardJurors
    }
  }
`);

export const useTotalLeaderboardJurors = () => {
  const { graphqlBatcher } = useGraphqlBatcher();

  return useQuery<TotalLeaderboardJurorsQuery>({
    queryKey: [`TotalLeaderboardJurors`],
    staleTime: Infinity,
    queryFn: async () =>
      await graphqlBatcher.fetch({
        id: crypto.randomUUID(),
        document: totalLeaderboardJurorsQuery,
        variables: {
          id: 0,
        },
      }),
  });
};
