import useSWR from "swr";
import { graphql } from "src/graphql";
import { DisputeDetailsQuery } from "src/graphql/graphql";
export type { DisputeDetailsQuery };

const disputeDetailsQuery = graphql(`
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
`);

export const useDisputeDetailsQuery = (id?: string | number) => {
  return useSWR<DisputeDetailsQuery>(() =>
    typeof id !== "undefined"
      ? {
          query: disputeDetailsQuery,
          variables: { disputeID: id?.toString() },
        }
      : false
  );
};
