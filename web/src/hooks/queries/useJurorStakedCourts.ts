import useSWR from "swr";
import { graphql } from "src/graphql";

const jurorStakedCourtsQuery = graphql(`
  query JurorStakedCourtsQuery($id: ID!) {
    user(id: $id) {
      tokens {
        court {
          id
          name
        }
      }
    }
  }
`);

export const useJurorStakedCourts = (id?: string) => {
  return useSWR(
    id
      ? {
          query: jurorStakedCourtsQuery,
          variables: { id },
        }
      : null
  );
};
