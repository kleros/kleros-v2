import { useQuery } from "@tanstack/react-query";

import { useGraphqlBatcher } from "context/GraphqlBatcher";

import { graphql } from "src/graphql";
import { HomePageQuery } from "src/graphql/graphql";
export type { HomePageQuery };

const homePageQuery = graphql(`
  query HomePage($timeframe: ID) {
    disputes(first: 3) {
      id
    }
    counters(where: { id_gt: $timeframe }) {
      id
      stakedPNK
      paidETH
      redistributedPNK
      activeJurors
      cases
    }
  }
`);

export const useHomePageQuery = (timeframe: number) => {
  const isEnabled = timeframe !== undefined;
  const { graphqlBatcher } = useGraphqlBatcher();

  return useQuery({
    queryKey: [`homePageQuery${timeframe}`],
    enabled: isEnabled,
    queryFn: async () => {
      const data = await graphqlBatcher.fetch({
        id: crypto.randomUUID(),
        document: homePageQuery,
        variables: { timeframe: timeframe.toString() },
      });
      return data;
    },
  });
};
