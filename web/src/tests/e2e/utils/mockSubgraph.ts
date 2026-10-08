import type { Page } from "@playwright/test";
import { Kind, parse, type OperationDefinitionNode, type ValueNode } from "graphql";

type Variables = Record<string, unknown>;
type Args = Record<string, unknown>;

/** Answers a root field of the app's subgraph queries, by field name. */
export type SubgraphResolvers = Record<string, (args: Args) => unknown>;

const toValue = (node: ValueNode, variables: Variables): unknown => {
  switch (node.kind) {
    case Kind.VARIABLE:
      return variables[node.name.value];
    case Kind.INT:
    case Kind.FLOAT:
      return Number(node.value);
    case Kind.NULL:
      return null;
    case Kind.LIST:
      return node.values.map((value) => toValue(value, variables));
    case Kind.OBJECT:
      return Object.fromEntries(node.fields.map((field) => [field.name.value, toValue(field.value, variables)]));
    default:
      return node.value;
  }
};

// Core and dispute template registry subgraphs, on a local graph node or The Graph's gateway and studio.
export const isSubgraphUrl = (url: URL) =>
  url.pathname.includes("/subgraphs/") || url.hostname.endsWith(".thegraph.com");

/**
 * Serves the app's subgraph queries from `resolvers`, so tests don't need a graph node.
 * The app merges concurrent queries into one request with aliased root fields, so every root field gets an answer:
 * fields without a resolver get an empty list (plural names) or null.
 */
export const mockSubgraph = async (page: Page, resolvers: SubgraphResolvers) => {
  await page.route(isSubgraphUrl, async (route) => {
    let body;
    try {
      body = route.request().postDataJSON();
    } catch {
      return route.fallback();
    }
    const { query, variables = {} } = body ?? {};
    if (typeof query !== "string") return route.fallback();

    const operation = parse(query).definitions.find(
      (definition): definition is OperationDefinitionNode => definition.kind === Kind.OPERATION_DEFINITION
    );
    const data: Record<string, unknown> = {};
    for (const selection of operation?.selectionSet.selections ?? []) {
      if (selection.kind !== Kind.FIELD) continue;
      const name = selection.name.value;
      const args = Object.fromEntries(
        (selection.arguments ?? []).map((argument) => [argument.name.value, toValue(argument.value, variables)])
      );
      const resolve = resolvers[name];
      data[selection.alias?.value ?? name] = resolve ? resolve(args) : name.endsWith("s") ? [] : null;
    }

    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data }) });
  });
};
