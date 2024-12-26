import { useQuery } from "@tanstack/react-query";

import { REFETCH_INTERVAL } from "consts/index";
import { DEFAULT_CHAIN } from "consts/chains";
import { useGraphqlBatcher } from "context/GraphqlBatcher";

import { graphql } from "src/graphql";
import { VotingHistoryQuery } from "src/graphql/graphql";
export type { VotingHistoryQuery };

const votingHistoryQuery = graphql(`
  query VotingHistory($disputeID: ID!) {
    dispute(id: $disputeID) {
      id
      createdAt
      ruled
      rounds {
        nbVotes
        jurorRewardsDispersed
        court {
          id
          name
        }
        timeline
        drawnJurors {
          juror {
            id
          }
          vote {
            ... on ClassicVote {
              commited
              justification {
                choice
                reference
              }
            }
          }
        }
      }
      disputeKitDispute {
        localRounds {
          ... on ClassicRound {
            winningChoice
            totalVoted
          }
        }
      }
    }
  }
`);

export const useVotingHistory = (disputeID?: string) => {
  const isEnabled = disputeID !== undefined;
  const { graphqlBatcher } = useGraphqlBatcher();

  return useQuery<VotingHistoryQuery>({
    queryKey: [`VotingHistory${disputeID}`],
    enabled: isEnabled,
    refetchInterval: REFETCH_INTERVAL,
    queryFn: async () =>
      await graphqlBatcher.fetch({
        id: crypto.randomUUID(),
        chainId: DEFAULT_CHAIN,
        document: votingHistoryQuery,
        variables: { disputeID },
      }),
  });
};
