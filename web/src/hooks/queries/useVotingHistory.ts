import useSWR from "swr";
import { gql } from "graphql-request";
import { VotingHistoryQuery } from "src/graphql/generated";
export type { VotingHistoryQuery };

const votingHistoryQuery = gql`
  query VotingHistory($disputeID: ID!) {
    dispute(id: $disputeID) {
      id
      rounds {
        nbVotes
      }
      disputeKitDispute {
        localRounds {
          ... on ClassicRound {
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
`;

export const useVotingHistory = (disputeID?: string): { data: typeof result; error: any; isValidating: boolean } => {
  const { data, error, isValidating } = useSWR(() =>
    typeof disputeID !== "undefined"
      ? {
          query: votingHistoryQuery,
          variables: { disputeID },
        }
      : false
  );
  const result = data ? (data as VotingHistoryQuery) : undefined;
  return { data: result, error, isValidating };
};
