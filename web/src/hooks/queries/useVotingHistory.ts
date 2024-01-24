import { graphql } from "src/graphql";
import { VotingHistoryQuery } from "src/graphql/graphql";
import { useQuery } from "@tanstack/react-query";
import { graphqlQueryFnHelper } from "utils/graphqlQueryFnHelper";
export type { VotingHistoryQuery };

const votingHistoryQuery = graphql(`
  query VotingHistory($disputeID: ID!) {
    dispute(id: $disputeID) {
      id
      createdAt
      rounds {
        nbVotes
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

  return useQuery<VotingHistoryQuery>({
    queryKey: ["refetchOnBlock", `VotingHistory${disputeID}`],
    enabled: isEnabled,
    queryFn: async () => await graphqlQueryFnHelper(votingHistoryQuery, { disputeID }),
  });
};
