import { Kind, parse, valueFromASTUntyped, type FieldNode, type OperationDefinitionNode } from "graphql";
import { http, HttpResponse } from "msw";

import { TEST_URLS } from "../env";

type Args = Record<string, unknown>;
export type RootResolvers = Record<string, (args: Args) => unknown>;
export interface SubgraphCall {
  field: string;
  args: Args;
}

interface GraphqlBody {
  query: string;
  variables?: Record<string, unknown>;
}

/**
 * Answers subgraph requests by top-level field name, not operationName: GraphqlBatcher merges
 * concurrent queries into one document with aliased fields (`_0_dispute`) and renamed variables.
 * Resolvers return builder output; an unmocked root field becomes a GraphQL error.
 */
export const subgraphHandler = (resolvers: RootResolvers, url: string = TEST_URLS.coreSubgraph) => {
  const calls: SubgraphCall[] = [];
  const handler = http.post(url, async ({ request }) => {
    const { query, variables = {} } = (await request.json()) as GraphqlBody;
    const operation = parse(query).definitions.find(
      (d): d is OperationDefinitionNode => d.kind === Kind.OPERATION_DEFINITION
    );
    const data: Record<string, unknown> = {};
    const errors: { message: string }[] = [];

    for (const selection of operation?.selectionSet.selections ?? []) {
      if (selection.kind !== Kind.FIELD) continue;
      const field = selection as FieldNode;
      const name = field.name.value;
      const args = Object.fromEntries(
        (field.arguments ?? []).map((arg) => [arg.name.value, valueFromASTUntyped(arg.value, variables)])
      );
      calls.push({ field: name, args });
      const resolver = resolvers[name];
      if (!resolver) {
        errors.push({ message: `unmocked subgraph root field "${name}"` });
        continue;
      }
      data[field.alias?.value ?? name] = resolver(args);
    }

    return HttpResponse.json(errors.length ? { data, errors } : { data });
  });
  return { handler, calls };
};
