import { graphql } from "src/graphql";
import { useSWRBlock } from "hooks/useSWRBlock";
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
      currentRound {
        id
      }
      currentRoundIndex
    }
  }
`);

export const useDisputeDetailsQuery = (id?: string | number) => {
  return useSWRBlock<DisputeDetailsQuery>(() =>
    typeof id !== "undefined"
      ? {
          query: disputeDetailsQuery,
          variables: { disputeID: id?.toString() },
        }
      : false
  );
};
