import { graphql } from "src/graphql";
import { VotingHistoryQuery } from "src/graphql/graphql";
import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";
export type { VotingHistoryQuery };

const votingHistoryQuery = graphql(`
  query VotingHistory($disputeID: ID!) {
    dispute(id: $disputeID) {
      id
      rounds {
        nbVotes
      }
      disputeKitDispute {
        localRounds {
          ... on ClassicRound {
            winningChoice
            totalVoted
            votes {
              id
              juror {
                id
              }
              ... on ClassicVote {
                choice
                justification
              }
            }
          }
        }
      }
    }
  }
`);

export const useVotingHistory = (disputeID?: string) => {
  const isEnabled = disputeID !== undefined;

  return useQuery({
    queryKey: [`VotingHistory${disputeID}`],
    enabled: isEnabled,
    queryFn: async () => {
      if (isEnabled) {
        return request(
          "https://api.thegraph.com/subgraphs/name/kleros/kleros-v2-core-arbitrum-goerli",
          votingHistoryQuery,
          {
            disputeID,
          }
        );
      }
      return;
    },
  });
};
