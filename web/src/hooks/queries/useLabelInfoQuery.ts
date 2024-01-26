import { graphql } from "src/graphql";
import { LabelInfoQuery } from "src/graphql/graphql";
import { useQuery } from "@tanstack/react-query";
import { graphqlQueryFnHelper } from "utils/graphqlQueryFnHelper";
export type { LabelInfoQuery };

const labelQuery = graphql(`
  query LabelInfo($address: String, $disputeID: ID!, $localRoundID: ID!) {
    dispute(id: $disputeID) {
      currentRuling
      period
      shifts(where: { juror: $address }) {
        ethAmount
        pnkAmount
      }
      currentRound {
        id
        drawnJurors(where: { juror: $address }, first: 1) {
          vote {
            ... on ClassicVote {
              choice
            }
          }
        }
      }
    }
    classicRound(id: $localRoundID) {
      contributions(where: { contributor: $address }) {
        amount
      }
    }
  }
`);

export const useLabelInfoQuery = (address?: string | null, disputeID?: string, localRoundID?: string) => {
  const isEnabled = !!(address && disputeID && localRoundID);
  return useQuery<LabelInfoQuery>({
    queryKey: [`labelQuery${[address, disputeID, localRoundID]}`],
    enabled: isEnabled,
    staleTime: Infinity,
    queryFn: async () => await graphqlQueryFnHelper(labelQuery, { address, disputeID, localRoundID }),
  });
};
