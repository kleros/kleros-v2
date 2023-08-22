import { useQuery } from "@tanstack/react-query";
import { graphql } from "src/graphql";
import { UserQuery } from "src/graphql/graphql";
import { graphqlQueryFnHelper } from "utils/graphqlQueryFnHelper";
export type { UserQuery };

const userQuery = graphql(`
  query User($address: ID!) {
    user(id: $address) {
      totalDisputes
      totalResolvedDisputes
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

export const useUserQuery = (address?: string) => {
  const isEnabled = address !== undefined;

  return useQuery<UserQuery>({
    queryKey: [`userQuery${address}`],
    enabled: isEnabled,
    queryFn: async () => graphqlQueryFnHelper(userQuery, { address }),
  });
};
