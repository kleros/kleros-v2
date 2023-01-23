import useSWR from "swr";
import { gql } from "graphql-request";
import { CourtTreeQuery } from "src/graphql/generated";
export type { CourtTreeQuery };

const courtTreeQuery = gql`
  query CourtTree {
    court(id: "1") {
      name
      id
      children(orderBy: name) {
        name
        id
        children {
          name
          id
          children {
            name
            id
            children {
              name
              id
              children {
                name
                id
              }
            }
          }
        }
      }
    }
  }
`;

export const useCourtTree = () => {
  const { data, error, isValidating } = useSWR({
    query: courtTreeQuery,
  });
  const result = data ? (data as CourtTreeQuery) : undefined;
  return { data: result, error, isValidating };
};
