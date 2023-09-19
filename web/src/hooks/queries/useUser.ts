import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";
import { graphql } from "src/graphql";
import { UserQuery, Dispute_Filter } from "src/graphql/graphql";
import { graphqlQueryFnHelper } from "utils/graphqlQueryFnHelper";
export type { UserQuery };

const userQuery = graphql(`
  query User($address: ID!, $where: Dispute_filter) {
    user(id: $address) {
      disputes(orderBy: lastPeriodChange, where: $where) {
        id
      }
      totalDisputes
      totalResolvedDisputes
      totalAppealingDisputes
      totalCoherent
      tokens {
        court {
          id
          name
        }
      }
      shifts {
        pnkAmount
        ethAmount
      }
    }
  }
`);

export const useUserQuery = (address?: Address, where?: Dispute_Filter) => {
  const isEnabled = address !== undefined;

  console.log("where user", where);

  return useQuery<UserQuery>({
    queryKey: [`userQuery${address?.toLowerCase()}`],
    enabled: isEnabled,
    queryFn: async () => await graphqlQueryFnHelper(userQuery, { address: address?.toLowerCase(), where }),
  });
};
