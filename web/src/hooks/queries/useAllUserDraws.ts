import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";

import { useGraphqlBatcher } from "context/GraphqlBatcher";
import { isUndefined } from "utils/index";
import { sanitizeFilter } from "utils/sanitizeFilter";

import { graphql } from "src/graphql";
import { UserDrawsQuery, Draw_Filter, OrderDirection } from "src/graphql/graphql";

const BATCH_SIZE = 1000;

const allUserDrawsQuery = graphql(`
  query AllUserDraws($jurorId: ID!, $skip: Int, $first: Int, $orderDirection: OrderDirection, $where: Draw_filter) {
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
            hiddenVotes
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

type Draw = NonNullable<UserDrawsQuery["user"]>["draws"][number];

/**
 * Hook to fetch ALL user draws by fetching in batches of 1000 until complete.
 * This overcomes the GraphQL 1000 entity limit by making multiple requests.
 */
export const useAllUserDraws = (jurorAddress?: Address, where?: Draw_Filter, sortOrder?: OrderDirection) => {
  const { graphqlBatcher } = useGraphqlBatcher();
  const sanitizedWhere = sanitizeFilter(where);
  const isEnabled = !isUndefined(jurorAddress);

  return useQuery<Draw[]>({
    queryKey: ["useAllUserDraws", jurorAddress?.toLowerCase(), sanitizedWhere, sortOrder],
    enabled: isEnabled,
    queryFn: async () => {
      const allDraws: Draw[] = [];
      let skip = 0;
      let hasMore = true;

      while (hasMore) {
        const result: UserDrawsQuery = await graphqlBatcher.fetch({
          id: crypto.randomUUID(),
          document: allUserDrawsQuery,
          variables: {
            jurorId: jurorAddress?.toLowerCase(),
            skip,
            first: BATCH_SIZE,
            where: sanitizedWhere,
            orderDirection: sortOrder ?? "desc",
          },
        });

        const draws = result.user?.draws ?? [];
        allDraws.push(...draws);

        // Check if we need more batches
        if (draws.length < BATCH_SIZE) {
          hasMore = false;
        } else {
          skip += BATCH_SIZE;
        }
      }

      return allDraws;
    },
  });
};
