import useSWR from "swr";
import { gql } from "graphql-request";
import { ClassicAppealQuery } from "src/graphql/generated";
export type { ClassicAppealQuery };

const classicAppealQuery = gql`
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
`;

export const useClassicAppealQuery = (id?: string | number) => {
  const { data, error, isValidating } = useSWR(() =>
    typeof id !== "undefined"
      ? {
          query: classicAppealQuery,
          variables: { disputeID: id?.toString() },
        }
      : false
  );
  const result = data ? (data as ClassicAppealQuery) : undefined;
  return { data: result, error, isValidating };
};
