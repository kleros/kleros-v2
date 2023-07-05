import useSWR from "swr";
import { gql } from "graphql-request";

const jurorRewardsQuery = gql`
  query JurorStakedCourtsQuery($address: ID!) {
    user(id: $address) {
      shifts {
        tokenAmount
        ethAmount
      }
    }
  }
`;

export const useJurorRewardsQuery = (address: string): { data: typeof result; error: any; isValidating: boolean } => {
  const { data, error, isValidating } = useSWR({
    query: jurorRewardsQuery,
    variables: { address },
  });

  const result = data ? data : undefined;
  return { data: result, error, isValidating };
};
