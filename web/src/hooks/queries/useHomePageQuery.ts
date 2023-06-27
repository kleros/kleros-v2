import useSWR from "swr";
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
  return useSWR<HomePageQuery>({
    query: homePageQuery,
    variables: { timeframe: timeframe.toString() },
  });
};
