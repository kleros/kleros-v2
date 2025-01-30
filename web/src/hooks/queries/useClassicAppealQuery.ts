import { useQuery } from "@tanstack/react-query";

import { REFETCH_INTERVAL, STALE_TIME } from "consts/index";
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
            answers {
              answerId
              count
              paidFee
              funded
            }
            fundedChoices
            appealFeesDispersed
            totalFeeDispersed
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
    queryKey: [`classicAppealQuery${id}`],
    enabled: isEnabled,
    refetchInterval: REFETCH_INTERVAL,
    staleTime: STALE_TIME,
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
