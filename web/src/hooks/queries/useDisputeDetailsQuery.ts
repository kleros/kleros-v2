import { useEffect } from "react";
import { graphql } from "src/graphql";
import { request } from "graphql-request";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DisputeDetailsQuery } from "src/graphql/graphql";
import { useWebSocketPublicClient } from "wagmi";
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

  const queryClient = useQueryClient();
  const publicClient = useWebSocketPublicClient();

  useEffect(() => {
    const unwatch = publicClient?.watchBlocks({
      onBlock: () => {
        console.log("block");
        queryClient.invalidateQueries(["DisputeDetailsQuery"]);
      },
    });
    return () => unwatch?.();
  }, [publicClient]);

  return useQuery({
    queryKey: ["DisputeDetailsQuery"],
    queryFn: async () =>
      request("https://api.thegraph.com/subgraphs/name/kleros/kleros-v2-core-arbitrum-goerli", disputeDetailsQuery, {
        disputeID: id?.toString()!,
      }),
  });
};
