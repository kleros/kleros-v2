import { useQuery } from "@tanstack/react-query";

import { useGraphqlBatcher } from "context/GraphqlBatcher";

import { graphql } from "src/graphql";
import { VotingHistoryQuery } from "src/graphql/graphql";
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
  const { graphqlBatcher } = useGraphqlBatcher();

  return useQuery<VotingHistoryQuery>({
    queryKey: ["refetchOnBlock", `VotingHistory${disputeID}`],
    enabled: isEnabled,
    queryFn: async () =>
      await graphqlBatcher.fetch({ id: crypto.randomUUID(), document: votingHistoryQuery, variables: { disputeID } }),
  });
};
