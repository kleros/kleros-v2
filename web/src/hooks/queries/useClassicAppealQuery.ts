import useSWR from "swr";
import { graphql } from "src/graphql";
import { ClassicAppealQuery } from "src/graphql/graphql";
export type { ClassicAppealQuery };

const classicAppealQuery = graphql(`
  query ClassicAppeal($disputeID: ID!) {
    dispute(id: $disputeID) {
      court {
        id
        timesPerPeriod
      }
      arbitrated {
        id
      }
      lastPeriodChange
      disputeKitDispute {
        id
        currentLocalRoundIndex
        localRounds {
          ... on ClassicRound {
            winningChoice
            paidFees
            fundedChoices
          }
        }
      }
    }
  }
`);

export const useClassicAppealQuery = (id?: string | number) => {
  return useSWR<ClassicAppealQuery>(() =>
    typeof id !== "undefined"
      ? {
          query: classicAppealQuery,
          variables: { disputeID: id?.toString() },
        }
      : false
  );
};
