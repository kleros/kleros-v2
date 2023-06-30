import useSWR from "swr";
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
      numberStakedJurors
      stake
      paidETH
      paidPNK
    }
  }
`);

export const useCourtDetails = (id?: string) => {
  return useSWR<CourtDetailsQuery>(
    id
      ? {
          query: courtDetailsQuery,
          variables: { id },
        }
      : null
  );
};
