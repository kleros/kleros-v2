import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";

import { STALE_TIME } from "consts/index";
import { useGraphqlBatcher } from "context/GraphqlBatcher";
import { isUndefined } from "utils/index";

import { graphql } from "src/graphql";
import { JurorActionDrawsQuery } from "src/graphql/graphql";

const BATCH_SIZE = 1000;
const REFETCH_INTERVAL = 60_000;

// Draws of the juror in the current round of unruled disputes waiting for commits or votes.
const jurorActionDrawsQuery = graphql(`
  query JurorActionDraws($juror: String!, $first: Int!, $skip: Int!) {
    draws(
      first: $first
      skip: $skip
      orderBy: id
      where: { juror: $juror, round_: { isCurrentRound: true }, dispute_: { ruled: false, period_in: [commit, vote] } }
    ) {
      id
      voteIDNum
      round {
        id
      }
      dispute {
        id
        period
        ruled
        lastPeriodChange
        lastPeriodChangeBlockNumber
        templateId
        arbitrableChainId
        arbitrated {
          id
        }
        court {
          name
        }
        currentRound {
          id
          hiddenVotes
          timesPerPeriod
          disputeKit {
            id
          }
        }
      }
      vote {
        ... on ClassicVote {
          commited
          voted
        }
      }
    }
  }
`);

export type JurorActionDraw = JurorActionDrawsQuery["draws"][number];

export const useJurorActionDraws = (jurorAddress?: Address) => {
  const { graphqlBatcher } = useGraphqlBatcher();

  return useQuery<JurorActionDraw[]>({
    queryKey: ["useJurorActionDraws", jurorAddress?.toLowerCase()],
    enabled: !isUndefined(jurorAddress),
    // Polling pauses while the tab is hidden; focusing the window refetches.
    refetchInterval: REFETCH_INTERVAL,
    staleTime: STALE_TIME,
    queryFn: async () => {
      const draws: JurorActionDraw[] = [];
      for (let skip = 0; ; skip += BATCH_SIZE) {
        const result: JurorActionDrawsQuery = await graphqlBatcher.fetch({
          id: crypto.randomUUID(),
          document: jurorActionDrawsQuery,
          variables: { juror: jurorAddress?.toLowerCase(), first: BATCH_SIZE, skip },
        });
        draws.push(...result.draws);
        if (result.draws.length < BATCH_SIZE) return draws;
      }
    },
  });
};
