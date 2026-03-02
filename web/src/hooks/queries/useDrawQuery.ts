import { useQuery } from "@tanstack/react-query";

import { useGraphqlBatcher } from "context/GraphqlBatcher";

import { graphql } from "src/graphql";
import { DrawQuery } from "src/graphql/graphql";
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
  const { graphqlBatcher } = useGraphqlBatcher();

  return useQuery<DrawQuery>({
    queryKey: ["useDrawQuery", address, disputeID, roundID],
    enabled: isEnabled,
    queryFn: async () =>
      await graphqlBatcher.fetch({
        id: crypto.randomUUID(),
        document: drawQuery,
        variables: { address, disputeID, roundID },
      }),
  });
};
