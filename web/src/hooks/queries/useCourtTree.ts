import { useQuery } from "@tanstack/react-query";

import { useGraphqlBatcher } from "context/GraphqlBatcher";

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
  const { graphqlBatcher } = useGraphqlBatcher();
  return useQuery<CourtTreeQuery>({
    queryKey: ["courtTreeQuery"],
    queryFn: async () =>
      await graphqlBatcher.fetch({ id: crypto.randomUUID(), document: courtTreeQuery, variables: {} }),
  });
};

interface IItem {
  label: string;
  value: string;
  children?: IItem[];
}

export const rootCourtToItems = (
  court: NonNullable<CourtTreeQuery["court"]>,
  value: "id" | "path" = "path"
): IItem => ({
  label: court.name ? court.name : "Unnamed Court",
  value: value === "id" ? court.id : `/courts/${court.id}`,
  children: court.children.length > 0 ? court.children.map((child) => rootCourtToItems(child, value)) : undefined,
});
