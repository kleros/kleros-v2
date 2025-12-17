import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";

import { useGraphqlBatcher } from "context/GraphqlBatcher";
import { isUndefined } from "utils/index";
import { sanitizeFilter } from "utils/sanitizeFilter";

import { graphql } from "src/graphql";
import { UserDrawsQuery, UserDrawsCountQuery, Draw_Filter, OrderDirection } from "src/graphql/graphql";
export type { UserDrawsQuery, UserDrawsCountQuery };

const userDrawsQuery = graphql(`
  query UserDraws($jurorId: ID!, $skip: Int, $first: Int, $orderDirection: OrderDirection, $where: Draw_filter) {
    user(id: $jurorId) {
      id
      totalResolvedVotes
      draws(first: $first, skip: $skip, orderBy: blockNumber, orderDirection: $orderDirection, where: $where) {
        id
        voteIDNum
        dispute {
          id
          disputeID
          period
          ruled
          currentRoundIndex
          arbitrated {
            id
          }
          court {
            id
            name
          }
        }
        round {
          id
        }
        vote {
          ... on ClassicVote {
            id
            choice
            commit
            commited
            voted
            localRound {
              ... on ClassicRound {
                id
                winningChoice
              }
            }
            justification {
              id
              choice
              reference
            }
          }
        }
      }
    }
  }
`);

const userDrawsCountQuery = graphql(`
  query UserDrawsCount($jurorId: ID!, $where: Draw_filter) {
    user(id: $jurorId) {
      id
      totalResolvedVotes
      draws(orderBy: blockNumber, where: $where) {
        id
        vote {
          ... on ClassicVote {
            id
            voted
            commited
          }
        }
      }
    }
  }
`);

export const useUserDraws = (
  jurorAddress?: Address,
  skip = 0,
  first = 5,
  where?: Draw_Filter,
  sortOrder?: OrderDirection
) => {
  const { graphqlBatcher } = useGraphqlBatcher();
  const sanitizedWhere = sanitizeFilter(where);
  const isEnabled = !isUndefined(jurorAddress);

  return useQuery<UserDrawsQuery>({
    queryKey: ["useUserDraws", jurorAddress?.toLowerCase(), skip, first, sanitizedWhere, sortOrder],
    enabled: isEnabled,
    queryFn: async () =>
      await graphqlBatcher.fetch({
        id: crypto.randomUUID(),
        document: userDrawsQuery,
        variables: {
          jurorId: jurorAddress?.toLowerCase(),
          skip,
          first,
          where: sanitizedWhere,
          orderDirection: sortOrder ?? "desc",
        },
      }),
  });
};

export const useUserDrawsCount = (jurorAddress?: Address, where?: Draw_Filter) => {
  const { graphqlBatcher } = useGraphqlBatcher();
  const sanitizedWhere = sanitizeFilter(where);
  const isEnabled = !isUndefined(jurorAddress);

  return useQuery<UserDrawsCountQuery>({
    queryKey: ["useUserDrawsCount", jurorAddress?.toLowerCase(), sanitizedWhere],
    enabled: isEnabled,
    queryFn: async () =>
      await graphqlBatcher.fetch({
        id: crypto.randomUUID(),
        document: userDrawsCountQuery,
        variables: {
          jurorId: jurorAddress?.toLowerCase(),
          where: sanitizedWhere,
        },
      }),
  });
};
