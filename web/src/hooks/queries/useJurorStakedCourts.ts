import useSWR from "swr";
import { graphql } from "src/graphql";
import { JurorStakedCourtsQuery } from "src/graphql/graphql";
export type { JurorStakedCourtsQuery };

const jurorStakedCourtsQuery = graphql(`
  query JurorStakedCourts($id: ID!) {
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
  return useSWR<JurorStakedCourtsQuery>(
    id
      ? {
          query: jurorStakedCourtsQuery,
          variables: { id },
        }
      : null
  );
};
