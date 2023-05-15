import { gql } from "graphql-request";
import { HomePageQuery } from "src/graphql/generated";
import useSWR from "swr";
export type { HomePageQuery };

const homePageQuery = gql`
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
`;

export const useHomePageQuery = (timeframe: number): { data: typeof result; error: any; isValidating: boolean } => {
  const { data, error, isValidating } = useSWR({
    query: homePageQuery,
    variables: { timeframe: timeframe.toString() },
  });
  const result = data ? (data as HomePageQuery) : undefined;
  return { data: result, error, isValidating };
};
