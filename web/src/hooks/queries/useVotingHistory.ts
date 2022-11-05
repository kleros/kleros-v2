import useSWR from "swr";
import { gql } from "graphql-request";
import { VotingHistoryQuery } from "src/graphql/generated";
export type { VotingHistoryQuery };

const votingHistoryQuery = gql`
  query VotingHistory($disputeID: ID!) {
    dispute(id: $disputeID) {
      rounds {
        nbVotes
        totalVoted
        votes {
          juror {
            id
          }
          choice
          justification
        }
      }
    }
  }
`;

export const useVotingHistory = (disputeID?: string) => {
  const { data, error, isValidating } = useSWR({
    query: votingHistoryQuery,
    variables: { disputeID },
  });
  const result = data ? (data as VotingHistoryQuery) : undefined;
  return { data: result, error, isValidating };
};
