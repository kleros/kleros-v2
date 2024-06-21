import { useQuery } from "@tanstack/react-query";

import { useGraphqlBatcher } from "context/GraphqlBatcher";

import { graphql } from "src/graphql";
import { ClassicAppealQuery } from "src/graphql/graphql";
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
  const { graphqlBatcher } = useGraphqlBatcher();

  return useQuery<ClassicAppealQuery>({
    queryKey: ["refetchOnBlock", `classicAppealQuery${id}`],
    enabled: isEnabled,
    queryFn: async () =>
      isEnabled
        ? await graphqlBatcher.fetch({
            id: crypto.randomUUID(),
            document: classicAppealQuery,
            variables: {
              disputeID: id?.toString(),
              orderBy: "timestamp",
              orderDirection: "asc",
            },
          })
        : undefined,
  });
};
