import useSWR from "swr";
import { graphql } from "src/graphql";
import { DrawQuery } from "src/graphql/graphql";
export type { DrawQuery };

const drawQuery = graphql(`
  query Draw($address: String, $disputeID: String) {
    draws(where: { dispute: $disputeID, juror: $address }) {
      voteID
    }
  }
`);

export const useDrawQuery = (address?: string | null, disputeID?: string) => {
  return useSWR<DrawQuery>({
    query: drawQuery,
    variables: { address, disputeID },
  });
};
