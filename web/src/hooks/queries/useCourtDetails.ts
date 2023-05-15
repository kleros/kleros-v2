import { gql } from "graphql-request";
import { CourtDetailsQuery } from "src/graphql/generated";
import useSWR from "swr";
export type { CourtDetailsQuery };

const courtDetailsQuery = gql`
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
`;

export const useCourtDetails = (id?: string): { data: typeof result; error: any; isValidating: boolean } => {
  const { data, error, isValidating } = useSWR(
    id
      ? {
          query: courtDetailsQuery,
          variables: { id },
        }
      : null
  );
  const result = data ? (data as CourtDetailsQuery) : undefined;
  return { data: result, error, isValidating };
};
