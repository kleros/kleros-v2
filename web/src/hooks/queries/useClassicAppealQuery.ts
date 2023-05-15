import { gql } from "graphql-request";
import { ClassicAppealQuery } from "src/graphql/generated";
import useSWR from "swr";
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

export const useClassicAppealQuery = (
  id?: string | number
): { data: typeof result; error: any; isValidating: boolean } => {
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
