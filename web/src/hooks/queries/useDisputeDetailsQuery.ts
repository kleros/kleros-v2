import useSWR from "swr";
import { gql } from "graphql-request";
import { DisputeDetailsQuery } from "src/graphql/generated";
export type { DisputeDetailsQuery };

const disputeDetailsQuery = gql`
  query DisputeDetails($disputeID: ID!) {
    dispute(id: $disputeID) {
      subcourtID {
        id
        timesPerPeriod
        hiddenVotes
        feeForJuror
      }
      arbitrated
      period
      ruled
      lastPeriodChange
    }
  }
`;

export const useDisputeDetailsQuery = (id?: string | number) => {
  const { data, error, isValidating } = useSWR({
    query: () => (typeof id !== "undefined" ? disputeDetailsQuery : false),
    variables: { disputeID: id?.toString() },
  });
  const result = data ? (data as DisputeDetailsQuery) : undefined;
  return { data: result, error, isValidating };
};
