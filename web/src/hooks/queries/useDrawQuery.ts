import useSWR from "swr";
import { gql } from "graphql-request";
import { DrawQuery } from "src/graphql/generated";
export type { DrawQuery };

const drawQuery = gql`
  query Draw($address: String, $disputeID: String) {
    draws(where: { dispute: $disputeID, juror: $address }) {
      voteID
    }
  }
`;

export const useDrawQuery = (
  address?: string | null,
  disputeID?: string
): { data: typeof result; error: any; isValidating: boolean } => {
  const { data, error, isValidating } = useSWR({
    query: drawQuery,
    variables: { address, disputeID },
  });
  const result = data ? (data as DrawQuery) : undefined;
  return { data: result, error, isValidating };
};
