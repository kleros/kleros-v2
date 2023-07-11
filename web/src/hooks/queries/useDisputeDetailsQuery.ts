import { graphql } from "src/graphql";
import { request } from "graphql-request";
import { useQuery } from "@tanstack/react-query";
import { DisputeDetailsQuery } from "src/graphql/graphql";
import { isUndefined } from "utils/index";
export type { DisputeDetailsQuery };

export const disputeDetailsQuery = graphql(`
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
  // return useSWR<DisputeDetailsQuery>(() =>
  //   typeof id !== "undefined"
  //     ? {
  //         query: disputeDetailsQuery,
  //         variables: { disputeID: id?.toString() },
  //       }
  //     : false
  // );

  return useQuery({
    queryKey: ["refetchOnBlock", `disputeDetailsQuery${id}`],
    enabled: !isUndefined(id),
    queryFn: async () => {
      console.log("query");
      return request(
        "https://api.thegraph.com/subgraphs/name/kleros/kleros-v2-core-arbitrum-goerli",
        disputeDetailsQuery,
        {
          disputeID: id?.toString()!,
        }
      );
    },
  });
};
