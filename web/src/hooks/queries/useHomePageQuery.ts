import useSWR from "swr";
import { gql } from "graphql-request";
import { HomePageQuery } from "src/graphql/generated";
export type { HomePageQuery };

const homePageQuery = gql`
  query HomePage($timeframe: ID) {
    disputes(first: 3) {
      id
    }
    pnkstakedDataPoints(where: { id_gt: $timeframe }) {
      id
      value
    }
    ethpaidDataPoints(where: { id_gt: $timeframe }) {
      id
      value
    }
    pnkredistributedDataPoints(where: { id_gt: $timeframe }) {
      id
      value
    }
    activeJurorsDataPoints(where: { id_gt: $timeframe }) {
      id
      value
    }
    casesDataPoints(where: { id_gt: $timeframe }) {
      id
      value
    }
  }
`;

export const useHomePageQuery = (timeframe: number) => {
  const { data, error, isValidating } = useSWR({
    query: homePageQuery,
    variables: { timeframe: timeframe.toString() },
  });
  const result = data ? (data as HomePageQuery) : undefined;
  return { data: result, error, isValidating };
};
