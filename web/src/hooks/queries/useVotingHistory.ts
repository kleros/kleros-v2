import useSWR from "swr";
import { graphql } from "src/graphql";
import { VotingHistoryQuery } from "src/graphql/graphql";
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
  return useSWR<VotingHistoryQuery>(() =>
    typeof disputeID !== "undefined"
      ? {
          query: votingHistoryQuery,
          variables: { disputeID },
        }
      : false
  );
};
