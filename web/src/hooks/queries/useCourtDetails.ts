import { useQuery } from "@tanstack/react-query";

import { useGraphqlBatcher } from "context/GraphqlBatcher";

import { graphql } from "src/graphql";
import { CourtDetailsQuery } from "src/graphql/graphql";
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
  const { graphqlBatcher } = useGraphqlBatcher();

  return useQuery<CourtDetailsQuery>({
    queryKey: ["refetchOnBlock", `courtDetails${id}`],
    enabled: isEnabled,
    queryFn: async () =>
      await graphqlBatcher.fetch({ id: crypto.randomUUID(), document: courtDetailsQuery, variables: { id } }),
  });
};
