import { graphql } from "src/graphql";
import { LabelInfoQuery } from "src/graphql/graphql";
import { useQuery } from "@tanstack/react-query";
import { graphqlQueryFnHelper } from "utils/graphqlQueryFnHelper";

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
  return useQuery<LabelInfoQuery>({
    queryKey: [`labelQuery${[address, disputeID]}`],
    enabled: isEnabled,
    staleTime: 60000,
    queryFn: async () => await graphqlQueryFnHelper(labelQuery, { address, disputeID }),
  });
};
