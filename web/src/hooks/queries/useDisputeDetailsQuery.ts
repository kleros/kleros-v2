import { useQuery } from "@tanstack/react-query";

import { REFETCH_INTERVAL } from "consts/index";
import { DEFAULT_CHAIN } from "consts/chains";
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
      isCrossChain
      arbitrableChainId
      externalDisputeId
      templateId
    }
  }
`);

export const useDisputeDetailsQuery = (id?: string | number) => {
  const isEnabled = id !== undefined;
  const { graphqlBatcher } = useGraphqlBatcher();

  return useQuery<DisputeDetailsQuery>({
    queryKey: [`disputeDetailsQuery${id}`],
    enabled: isEnabled,
    refetchInterval: REFETCH_INTERVAL,
    queryFn: async () =>
      await graphqlBatcher.fetch({
        id: crypto.randomUUID(),
        document: disputeDetailsQuery,
        chainId: DEFAULT_CHAIN,
        variables: { disputeID: id?.toString() },
      }),
  });
};
