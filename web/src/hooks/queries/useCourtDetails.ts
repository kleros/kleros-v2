import useSWR from "swr";
import { gql } from "graphql-request";
import { CourtDetailsQuery } from "src/graphql/generated";
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

export const useCourtDetails = (id?: string) => {
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
