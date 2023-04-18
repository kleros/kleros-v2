/* eslint-disable prettier/prettier */
import useSWR from "swr";
import { gql } from "graphql-request";
import { CasesPageQueryId } from "src/graphql/generated";
export type { CasesPageQueryId };

const casesQuery = gql`
  query DisputeById($disputeID: ID!) {
    dispute(id: $disputeID) {
      id
      arbitrated {
        id
      }
      court {
        id
        policy
        feeForJuror
        timesPerPeriod
      }
      period
      lastPeriodChange
    }
    counter(id: "0") {
      cases
    }
  }
`;

export const useCasesQueryById = (id?: string | number) => {
  const { data, error, isValidating } = useSWR(() =>
    typeof id !== "undefined"
      ? {
          query: casesQuery,
          variables: { disputeID: id?.toString() },
        }
      : false
  );
  const result = data ? (data as CasesPageQueryId) : undefined;
  return { data: result, error, isValidating };
};
