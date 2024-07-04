import { useQuery } from "@tanstack/react-query";

import { useGraphqlBatcher } from "context/GraphqlBatcher";

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
      currentRuling
      overridden
      tied
      currentRound {
        id
        nbVotes
      }
      currentRoundIndex
    }
  }
`);

export const useDisputeDetailsQuery = (id?: string | number) => {
  const isEnabled = id !== undefined;
  const { graphqlBatcher } = useGraphqlBatcher();

  return useQuery<DisputeDetailsQuery>({
    queryKey: ["refetchOnBlock", `disputeDetailsQuery${id}`],
    enabled: isEnabled,
    queryFn: async () =>
      await graphqlBatcher.fetch({
        id: crypto.randomUUID(),
        document: disputeDetailsQuery,
        variables: { disputeID: id?.toString() },
      }),
  });
};
