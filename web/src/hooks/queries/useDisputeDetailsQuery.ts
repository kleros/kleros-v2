import { graphql } from "src/graphql";
import { DisputeDetailsQuery } from "src/graphql/graphql";
import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";
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
      currentRound {
        id
      }
      currentRoundIndex
    }
  }
`);

export const useDisputeDetailsQuery = (id?: string | number) => {
  const isEnabled = id !== undefined;

  return useQuery({
    queryKey: ["refetchOnBlock", `disputeDetailsQuery${id}`],
    enabled: isEnabled,
    queryFn: async () => {
      if (isEnabled) {
        return request(
          "https://api.thegraph.com/subgraphs/name/kleros/kleros-v2-core-arbitrum-goerli",
          disputeDetailsQuery,
          {
            disputeID: id.toString(),
          }
        );
      }
      return;
    },
  });
};
