import { useQuery } from "@tanstack/react-query";

import { REFETCH_INTERVAL, STALE_TIME } from "consts/index";
import { useGraphqlBatcher } from "context/GraphqlBatcher";

import { graphql } from "src/graphql";
import { VotingHistoryQuery } from "src/graphql/graphql";
export type { VotingHistoryQuery };

const votingHistoryQuery = graphql(`
  query VotingHistory($disputeID: ID!) {
    dispute(id: $disputeID) {
      id
      createdAt
      transactionHash
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
                transactionHash
                timestamp
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
    staleTime: STALE_TIME,
    queryFn: async () =>
      await graphqlBatcher.fetch({ id: crypto.randomUUID(), document: votingHistoryQuery, variables: { disputeID } }),
  });
};
