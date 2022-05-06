import useSWR from "swr";
import { gql } from "graphql-request";
import { ChartQuery } from "src/graphql/generated";

const chartQuery = gql`
  query Chart {
    pnkstakedDataPoints(where: { id_gt: 1 }) {
      id
      value
    }
    ethpaidDataPoints(where: { id_gt: 1 }) {
      id
      value
    }
    pnkredistributedDataPoints(where: { id_gt: 1 }) {
      id
      value
    }
    activeJurorsDataPoints(where: { id_gt: 1 }) {
      id
      value
    }
    casesDataPoints(where: { id_gt: 1 }) {
      id
      value
    }
  }
`;

export const useChartQuery = () => {
  const { data, error, isValidating } = useSWR(chartQuery);
  const result = data as ChartQuery;
  return { result, error, isValidating };
};
