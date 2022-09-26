import useSWR from "swr";
import { gql } from "graphql-request";
import { CasesPageQuery } from "src/graphql/generated";
export type { CasesPageQuery };

const casesQuery = gql`
  query CasesPage($skip: Int) {
    disputes(first: 3, skip: $skip) {
      id
      arbitrated
      subcourtID {
        id
        policy
        feeForJuror
        timesPerPeriod
      }
      period
      lastPeriodChange
    }
  }
`;

export const useCasesQuery = (skip: number) => {
  const { data, error, isValidating } = useSWR({
    query: casesQuery,
    variables: { skip: skip },
  });
  const result = data ? (data as CasesPageQuery) : undefined;
  return { data: result, error, isValidating };
};
