import { useQuery } from "@tanstack/react-query";

import { useGraphqlBatcher } from "context/GraphqlBatcher";

import { graphql } from "src/graphql";
import { LabelInfoQuery } from "src/graphql/graphql";

const labelQuery = graphql(`
  query LabelInfo($address: String, $disputeID: ID!) {
    dispute(id: $disputeID) {
      period

      shifts(where: { juror: $address }) {
        ethAmount
        pnkAmount
      }
      rounds {
        drawnJurors(where: { juror: $address }, first: 1) {
          vote {
            ... on ClassicVote {
              choice
            }
          }
        }
      }
      disputeKitDispute {
        localRounds {
          ... on ClassicRound {
            contributions(where: { contributor: $address }) {
              amount
              rewardAmount
            }
          }
        }
      }
    }
  }
`);

export const useLabelInfoQuery = (address?: string | null, disputeID?: string) => {
  const isEnabled = !!(address && disputeID);
  const { graphqlBatcher } = useGraphqlBatcher();

  return useQuery<LabelInfoQuery>({
    queryKey: [`labelQuery${[address, disputeID]}`],
    enabled: isEnabled,
    staleTime: 60000,
    queryFn: async () =>
      await graphqlBatcher.fetch({
        id: crypto.randomUUID(),
        document: labelQuery,
        variables: { address, disputeID },
      }),
  });
};
