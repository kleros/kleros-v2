import useSWR from "swr";
import { graphql } from "src/graphql";
import { UserQuery } from "src/graphql/graphql";
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
  return useSWR<UserQuery>(
    address
      ? {
          query: userQuery,
          variables: { address },
        }
      : null
  );
};
