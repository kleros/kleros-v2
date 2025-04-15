import { useQuery } from "@tanstack/react-query";

import { REFETCH_INTERVAL, STALE_TIME } from "consts/index";
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
      effectiveNumberStakedJurors
      numberVotes
      stake
      effectiveStake
      paidETH
      paidPNK
      timesPerPeriod
      feeForJuror
      name
    }
  }
`);

export const useCourtDetails = (id?: string) => {
  const isEnabled = id !== undefined;
  const { graphqlBatcher } = useGraphqlBatcher();

  return useQuery<CourtDetailsQuery>({
    queryKey: [`courtDetails${id}`],
    enabled: isEnabled,
    refetchInterval: REFETCH_INTERVAL,
    staleTime: STALE_TIME,
    queryFn: async () =>
      await graphqlBatcher.fetch({ id: crypto.randomUUID(), document: courtDetailsQuery, variables: { id } }),
  });
};
