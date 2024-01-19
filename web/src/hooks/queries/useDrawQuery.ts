import { graphql } from "src/graphql";
import { DrawQuery } from "src/graphql/graphql";
import { useQuery } from "@tanstack/react-query";
import { graphqlQueryFnHelper } from "utils/graphqlQueryFnHelper";
export type { DrawQuery };

const drawQuery = graphql(`
  query Draw($address: String, $disputeID: String, $roundID: String) {
    draws(first: 1000, where: { dispute: $disputeID, juror: $address, round: $roundID }) {
      voteIDNum
      vote {
        ... on ClassicVote {
          commit
          commited
        }
      }
    }
  }
`);

export const useDrawQuery = (address?: string | null, disputeID?: string, roundID?: string) => {
  const isEnabled = !!(address && disputeID && roundID);
  return useQuery<DrawQuery>({
    queryKey: [`drawQuery${[address, disputeID, roundID]}`],
    enabled: isEnabled,
    queryFn: async () => await graphqlQueryFnHelper(drawQuery, { address, disputeID, roundID }),
  });
};
