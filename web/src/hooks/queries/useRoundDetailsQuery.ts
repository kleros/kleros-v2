import { useQuery } from "@tanstack/react-query";

import { REFETCH_INTERVAL, STALE_TIME } from "consts/index";
import { useGraphqlBatcher } from "context/GraphqlBatcher";

import { graphql } from "src/graphql";
import { RoundDetailsQuery } from "src/graphql/graphql";
import { isUndefined } from "src/utils";

const roundDetailsQuery = graphql(`
  query RoundDetails($roundID: ID!) {
    round(id: $roundID) {
      court {
        id
      }
      nbVotes
      disputeKit {
        id
      }
      dispute {
        disputeKitDispute {
          ... on ClassicDispute {
            extraData
          }
        }
      }
    }
  }
`);

export const useRoundDetailsQuery = (disputeId?: string, roundIndex?: number) => {
  const isEnabled = !isUndefined(disputeId) && !isUndefined(roundIndex);
  const { graphqlBatcher } = useGraphqlBatcher();

  return useQuery<RoundDetailsQuery>({
    queryKey: [`roundDetailsQuery${disputeId}-${roundIndex}`],
    enabled: isEnabled,
    refetchInterval: REFETCH_INTERVAL,
    staleTime: STALE_TIME,
    queryFn: async () =>
      await graphqlBatcher.fetch({
        id: crypto.randomUUID(),
        document: roundDetailsQuery,
        variables: { roundID: `${disputeId}-${roundIndex}` },
      }),
  });
};
