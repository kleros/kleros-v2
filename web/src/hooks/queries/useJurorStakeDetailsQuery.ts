import { useQuery } from "@tanstack/react-query";

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
      staked
      locked
    }
  }
`);

export const useJurorStakeDetailsQuery = (userId?: string) => {
  const isEnabled = userId !== undefined;
  const { graphqlBatcher } = useGraphqlBatcher();

  return useQuery<JurorStakeDetailsQuery>({
    queryKey: ["refetchOnBlock", `jurorStakeDetails${userId}`],
    enabled: isEnabled,
    queryFn: async () =>
      await graphqlBatcher.fetch({ id: crypto.randomUUID(), document: jurorStakeDetailsQuery, variables: { userId } }),
  });
};
