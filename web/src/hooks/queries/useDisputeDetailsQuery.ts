import { useQuery } from "@tanstack/react-query";

import { REFETCH_INTERVAL, STALE_TIME } from "consts/index";
import { useGraphqlBatcher } from "context/GraphqlBatcher";

import { graphql } from "src/graphql";
import { DisputeDetailsQuery } from "src/graphql/graphql";
import { isUndefined } from "src/utils";

import { useDisputeArchiveSnapshot } from "./useDisputeArchiveSnapshot";

export type { DisputeDetailsQuery };

const disputeDetailsQuery = graphql(`
  query DisputeDetails($disputeID: ID!) {
    dispute(id: $disputeID) {
      court {
        id
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
        timesPerPeriod
        hiddenVotes
        disputeKit {
          id
          address
        }
      }
      currentRoundIndex
      isCrossChain
      arbitrableChainId
      templateId
      rulingTimestamp
      rulingTransactionHash
      isArchived
      archiveCid
    }
  }
`);

export const useDisputeDetailsQuery = (id?: string | number) => {
  const disputeID = id?.toString();
  const { data: archivedData, isLoading: isLoadingArchivedData } = useDisputeArchiveSnapshot(disputeID);

  const isEnabled = !isUndefined(id) && !isLoadingArchivedData;
  const { graphqlBatcher } = useGraphqlBatcher();

  return useQuery<DisputeDetailsQuery>({
    queryKey: [`disputeDetailsQuery${id}`],
    enabled: isEnabled,
    refetchInterval: REFETCH_INTERVAL,
    staleTime: STALE_TIME,
    queryFn: async () => {
      if (!isUndefined(archivedData?.dispute)) {
        return { dispute: { ...archivedData.dispute, isArchived: true } };
      }

      return await graphqlBatcher.fetch({
        id: crypto.randomUUID(),
        document: disputeDetailsQuery,
        variables: { disputeID },
      });
    },
  });
};
