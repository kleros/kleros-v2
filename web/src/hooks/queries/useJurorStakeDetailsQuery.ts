import { useQuery } from "@tanstack/react-query";

import { REFETCH_INTERVAL } from "consts/index";
import { DEFAULT_CHAIN } from "consts/chains";
import { useGraphqlBatcher } from "context/GraphqlBatcher";

import { graphql } from "src/graphql";
import { JurorStakeDetailsQuery } from "src/graphql/graphql";
export type { JurorStakeDetailsQuery };

const jurorStakeDetailsQuery = graphql(`
  query JurorStakeDetails($userId: String) {
    jurorTokensPerCourts(where: { juror: $userId }) {
      court {
        id
        name
      }
      effectiveStake
      staked
      locked
    }
  }
`);

export const useJurorStakeDetailsQuery = (userId?: string) => {
  const isEnabled = userId !== undefined;
  const { graphqlBatcher } = useGraphqlBatcher();

  return useQuery<JurorStakeDetailsQuery>({
    queryKey: [`jurorStakeDetails${userId}`],
    enabled: isEnabled,
    refetchInterval: REFETCH_INTERVAL,
    queryFn: async () =>
      await graphqlBatcher.fetch({
        id: crypto.randomUUID(),
        document: jurorStakeDetailsQuery,
        chainId: DEFAULT_CHAIN,
        variables: { userId },
      }),
  });
};
