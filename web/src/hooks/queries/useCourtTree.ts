import useSWR from "swr";
import { graphql } from "src/graphql";
import { CourtTreeQuery } from "src/graphql/graphql";
export type { CourtTreeQuery };

const courtTreeQuery = graphql(`
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
`);

export const useCourtTree = () => {
  return useSWR<CourtTreeQuery>({
    query: courtTreeQuery,
  });
};
