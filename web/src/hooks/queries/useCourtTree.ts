import { useQuery } from "@tanstack/react-query";

import { useGraphqlBatcher } from "context/GraphqlBatcher";

import { STALE_TIME } from "src/consts";
import { graphql } from "src/graphql";
import { CourtTreeQuery } from "src/graphql/graphql";
import type { CascaderItem } from "src/utils/uiComponentsTypes";
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
    staleTime: STALE_TIME,
    queryFn: async () =>
      await graphqlBatcher.fetch({ id: crypto.randomUUID(), document: courtTreeQuery, variables: {} }),
  });
};

/**
 * Converts a court tree into the item shape accepted by the
 * `@kleros/ui-components-library` `DropdownCascader`. `id` and `itemValue` are
 * both set to the court's id (or `/courts/:id` path) — court ids are unique
 * across the tree, so they double as react-aria collection keys.
 */
export const rootCourtToItems = (
  court: NonNullable<CourtTreeQuery["court"]>,
  value: "id" | "path" = "path"
): CascaderItem => {
  const itemValue = value === "id" ? court.id : `/courts/${court.id}`;
  return {
    label: court.name ? court.name : "Unnamed Court",
    itemValue,
    id: itemValue,
    children:
      court.children.length > 0
        ? court.children.map((child) => rootCourtToItems(child as NonNullable<CourtTreeQuery["court"]>, value))
        : undefined,
  };
};
