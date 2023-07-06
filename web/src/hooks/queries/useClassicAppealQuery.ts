import { graphql } from "src/graphql";
import { useSWRBlock } from "hooks/useSWRBlock";
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
  return useSWRBlock<ClassicAppealQuery>(() =>
    typeof id !== "undefined"
      ? {
          query: classicAppealQuery,
          variables: { disputeID: id?.toString() },
        }
      : false
  );
};
