import { graphql } from "src/graphql";
import { ClassicAppealQuery } from "src/graphql/graphql";
import { useQuery } from "@tanstack/react-query";
import { graphqlQueryFnHelper } from "utils/graphqlQueryFnHelper";
export type { ClassicAppealQuery };

const classicAppealQuery = graphql(`
  query ClassicAppeal($disputeID: ID!, $orderBy: DisputeKitDispute_orderBy, $orderDirection: OrderDirection) {
    dispute(id: $disputeID) {
      period
      court {
        id
        timesPerPeriod
      }
      arbitrated {
        id
      }
      lastPeriodChange
      disputeKitDispute(orderBy: $orderBy, orderDirection: $orderDirection) {
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
  const isEnabled = id !== undefined;

  return useQuery<ClassicAppealQuery>({
    queryKey: ["refetchOnBlock", `classicAppealQuery${id}`],
    enabled: isEnabled,
    queryFn: async () =>
      isEnabled
        ? await graphqlQueryFnHelper(classicAppealQuery, {
            disputeID: id?.toString(),
            orderBy: "timestamp",
            orderDirection: "asc",
          })
        : undefined,
  });
};
