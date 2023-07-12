import { graphql } from "src/graphql";
import { UserQuery } from "src/graphql/graphql";
import { useQuery } from "@tanstack/react-query";
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
        tokenAmount
        ethAmount
      }
    }
  }
`);

export const useUserQuery = (address?: string) => {
  const isEnabled = address !== undefined;

  return useQuery({
    queryKey: ["userQuery"],
    enabled: isEnabled,
    queryFn: async () => await graphqlQueryFnHelper(userQuery, { address }),
  });
};
