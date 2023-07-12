import { graphql } from "src/graphql";
import { ClassicAppealQuery } from "src/graphql/graphql";
import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";
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
  const isEnabled = id !== undefined;

  return useQuery({
    queryKey: ["refetchOnBlock", `classicAppealQuery${id}`],
    enabled: isEnabled,
    queryFn: async () => {
      if (isEnabled) {
        return request(
          "https://api.thegraph.com/subgraphs/name/kleros/kleros-v2-core-arbitrum-goerli",
          classicAppealQuery,
          {
            disputeID: id.toString(),
          }
        );
      }
      return;
    },
  });
};
