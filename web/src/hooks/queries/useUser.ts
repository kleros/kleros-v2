import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";

import { useGraphqlBatcher } from "context/GraphqlBatcher";

import { graphql } from "src/graphql";
import { UserQuery, Dispute_Filter, UserDisputeFilterQuery, UserDetailsFragment } from "src/graphql/graphql";
export type { UserQuery, UserDetailsFragment };

export const userFragment = graphql(`
  fragment UserDetails on User {
    totalDisputes
    totalResolvedDisputes
    totalAppealingDisputes
    totalCoherent
    coherenceScore
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
`);

const userQuery = graphql(`
  query User($address: ID!) {
    user(id: $address) {
      disputes(orderBy: lastPeriodChange) {
        id
      }
      ...UserDetails
    }
  }
`);

const userQueryDisputeFilter = graphql(`
  query UserDisputeFilter($address: ID!, $where: Dispute_filter) {
    user(id: $address) {
      disputes(orderBy: lastPeriodChange, where: $where) {
        id
      }
      ...UserDetails
    }
  }
`);

export const useUserQuery = (address?: Address, where?: Dispute_Filter) => {
  const isEnabled = address !== undefined;
  const query = where ? userQueryDisputeFilter : userQuery;
  const { graphqlBatcher } = useGraphqlBatcher();

  return useQuery<UserQuery | UserDisputeFilterQuery>({
    queryKey: [`userQuery${address?.toLowerCase()}`],
    enabled: isEnabled,
    queryFn: async () =>
      await graphqlBatcher.fetch({
        id: crypto.randomUUID(),
        document: query,
        variables: { address: address?.toLowerCase(), where },
      }),
  });
};
