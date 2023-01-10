import useSWR from "swr";
import { gql } from "graphql-request";
import { VotingHistoryQuery } from "src/graphql/generated";
export type { VotingHistoryQuery };

const votingHistoryQuery = gql`
  query VotingHistory($disputeID: ID!) {
    dispute(id: $disputeID) {
      rounds {
        nbVotes
      }
      disputeKitDispute {
        localRounds {
          ... on ClassicRound {
            totalVoted
            votes {
              id
              choice
              justification
              juror {
                id
              }
            }
          }
        }
      }
    }
  }
`;

export const useVotingHistory = (disputeID?: string) => {
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
