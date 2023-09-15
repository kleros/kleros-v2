import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";
import { graphql } from "src/graphql";
import { UserQuery } from "src/graphql/graphql";
import { graphqlQueryFnHelper } from "utils/graphqlQueryFnHelper";
export type { UserQuery };

const userQuery = graphql(`
  query User($address: ID!) {
    user(id: $address) {
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

export const useUserQuery = (address?: Address) => {
  const isEnabled = address !== undefined;

  return useQuery<UserQuery>({
    queryKey: [`userQuery${address?.toLowerCase()}`],
    enabled: isEnabled,
    queryFn: async () => await graphqlQueryFnHelper(userQuery, { address: address?.toLowerCase() }),
  });
};
