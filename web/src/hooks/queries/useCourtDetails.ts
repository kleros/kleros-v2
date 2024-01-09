import { graphql } from "src/graphql";
import { CourtDetailsQuery } from "src/graphql/graphql";
import { useQuery } from "@tanstack/react-query";
import { graphqlQueryFnHelper } from "utils/graphqlQueryFnHelper";
export type { CourtDetailsQuery };

const courtDetailsQuery = graphql(`
  query CourtDetails($id: ID!) {
    court(id: $id) {
      policy
      minStake
      alpha
      numberDisputes
      numberClosedDisputes
      numberAppealingDisputes
      numberStakedJurors
      stake
      paidETH
      paidPNK
      timesPerPeriod
    }
  }
`);

export const useCourtDetails = (id?: string) => {
  const isEnabled = id !== undefined;

  return useQuery<CourtDetailsQuery>({
    queryKey: ["refetchOnBlock", `courtDetails${id}`],
    enabled: isEnabled,
    queryFn: async () => await graphqlQueryFnHelper(courtDetailsQuery, { id }),
  });
};
