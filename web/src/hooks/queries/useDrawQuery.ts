import useSWR from "swr";
import { graphql } from "src/graphql";
import { DrawQuery } from "src/graphql/graphql";
export type { DrawQuery };

const drawQuery = graphql(`
  query Draw($address: String, $disputeID: String, $roundID: String) {
    draws(where: { dispute: $disputeID, juror: $address, round: $roundID }) {
      voteID
    }
  }
`);

export const useDrawQuery = (address?: string | null, disputeID?: string, roundID?: string) => {
  return useSWR<DrawQuery>({
    query: drawQuery,
    variables: { address, disputeID, roundID },
  });
};
