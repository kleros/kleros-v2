import { graphql } from "src/graphql";
import { DrawQuery } from "src/graphql/graphql";
import { useQuery } from "@tanstack/react-query";
import { graphqlQueryFnHelper } from "utils/graphqlQueryFnHelper";
export type { DrawQuery };

const drawQuery = graphql(`
  query Draw($address: String, $disputeID: String, $roundID: String) {
    draws(where: { dispute: $disputeID, juror: $address, round: $roundID }) {
      voteID
    }
  }
`);

export const useDrawQuery = (address?: string | null, disputeID?: string, roundID?: string) => {
  const isEnabled = !!(address && disputeID && roundID);
  return useQuery({
    queryKey: [`drawQuery${[address, disputeID, roundID]}`],
    enabled: isEnabled,
    queryFn: async () => graphqlQueryFnHelper(drawQuery, { address, disputeID, roundID }),
  });
};
