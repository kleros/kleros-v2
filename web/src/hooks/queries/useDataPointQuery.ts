import useSWR from "swr";
import { gql } from "graphql-request";
import { CountersQuery } from "src/graphql/generated";

const countersQuery = gql`
  query Counters {
    pnkstakedDataPoint(id: 0) {
      value
    }
    ethpaidDataPoint(id: 0) {
      value
    }
    pnkredistributedDataPoint(id: 0) {
      value
    }
    activeJurorsDataPoint(id: 0) {
      value
    }
    casesDataPoint(id: 0) {
      value
    }
  }
`;

export const useDataPointQuery = () => {
  const { data, error, isValidating } = useSWR(countersQuery);
  const result = data ? (data as CountersQuery) : {};
  return { result, error, isValidating };
};
