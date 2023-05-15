import { gql } from "graphql-request";
import { DisputeDetailsQuery } from "src/graphql/generated";
import useSWR from "swr";
export type { DisputeDetailsQuery };

const disputeDetailsQuery = gql`
  query DisputeDetails($disputeID: ID!) {
    dispute(id: $disputeID) {
      court {
        id
        timesPerPeriod
        hiddenVotes
        feeForJuror
      }
      arbitrated {
        id
      }
      period
      ruled
      lastPeriodChange
    }
  }
`;

export const useDisputeDetailsQuery = (
  id?: string | number
): { data: typeof result; error: any; isValidating: boolean } => {
  const { data, error, isValidating } = useSWR(() =>
    typeof id !== "undefined"
      ? {
          query: disputeDetailsQuery,
          variables: { disputeID: id?.toString() },
        }
      : false
  );
  const result = data ? (data as DisputeDetailsQuery) : undefined;
  return { data: result, error, isValidating };
};
