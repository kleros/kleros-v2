import { graphql } from "src/graphql";
import { JurorStakeDetailsQuery } from "src/graphql/graphql";
import { useQuery } from "@tanstack/react-query";
import { graphqlQueryFnHelper } from "utils/graphqlQueryFnHelper";
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

  return useQuery<JurorStakeDetailsQuery>({
    queryKey: ["refetchOnBlock", `jurorStakeDetails${userId}`],
    enabled: isEnabled,
    queryFn: async () => await graphqlQueryFnHelper(jurorStakeDetailsQuery, { userId }),
  });
};
