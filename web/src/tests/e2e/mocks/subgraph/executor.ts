import { readFileSync } from "node:fs";

import {
  buildSchema,
  execute,
  getNamedType,
  GraphQLError,
  isEnumType,
  isListType,
  isNonNullType,
  isScalarType,
  parse,
  type ExecutionResult,
  type GraphQLFieldResolver,
  type GraphQLOutputType,
  type GraphQLSchema,
  type GraphQLTypeResolver,
} from "graphql";

import { select } from "./query";

export type SubgraphName = "core" | "drt";

/** Root `Query` field resolver; receives the field arguments with variables already substituted. */
export type RootResolver = (args: Record<string, any>) => unknown;
export type RootResolvers = Partial<Record<string, RootResolver>>;

export type SubgraphCall = { subgraph: SubgraphName; field: string; args: Record<string, any> };

const schemas = new Map<SubgraphName, GraphQLSchema>();

const loadSchema = (name: SubgraphName) => {
  let schema = schemas.get(name);
  if (!schema) {
    const sdl = readFileSync(new URL(`../schemas/${name}.graphql`, import.meta.url), "utf8");
    schema = buildSchema(sdl);
    schemas.set(name, schema);
  }
  return schema;
};

const SCALAR_DEFAULTS: Record<string, unknown> = {
  ID: "0",
  String: "",
  Int: 0,
  Float: 0,
  Boolean: false,
  BigInt: "0",
  BigDecimal: "0",
  Int8: "0",
  Bytes: "0x",
  Timestamp: "0",
};

// Fields a builder left out resolve to an empty value so builders only carry what a test cares about.
// A missing non-null object is an error: it means the builder is incomplete for the query.
const emptyValue = (type: GraphQLOutputType, path: string): unknown => {
  if (!isNonNullType(type)) return null;
  const inner = type.ofType;
  if (isListType(inner)) return [];
  const named = getNamedType(inner);
  if (isScalarType(named)) return SCALAR_DEFAULTS[named.name] ?? null;
  if (isEnumType(named)) return named.getValues()[0].value;
  throw new GraphQLError(`e2e subgraph mock: ${path} is non-null but the builder did not provide it`);
};

/**
 * Executes a (possibly merged by @graphql-tools/batch-execute) query against the real subgraph schema.
 * Root fields come from `resolvers`; nested fields are read from the returned objects. Nested lists get
 * where/orderBy/first/skip applied; a function-valued property is called with the field's arguments instead.
 */
export const executeSubgraphQuery = (
  name: SubgraphName,
  body: { query: string; variables?: Record<string, unknown>; operationName?: string },
  resolvers: RootResolvers,
  calls: SubgraphCall[]
): ExecutionResult => {
  const schema = loadSchema(name);
  const queryType = schema.getQueryType();

  const fieldResolver: GraphQLFieldResolver<any, unknown> = (source, args, _ctx, info) => {
    if (info.parentType === queryType) {
      calls.push({ subgraph: name, field: info.fieldName, args });
      const resolver = resolvers[info.fieldName];
      if (!resolver) throw new GraphQLError(`e2e subgraph mock: no resolver for ${name} Query.${info.fieldName}`);
      const value = resolver(args);
      return value === undefined ? emptyValue(info.returnType, `Query.${info.fieldName}`) : value;
    }
    const raw = source?.[info.fieldName];
    const isCollection = info.parentType.getFields()[info.fieldName].args.some((arg) => arg.name === "first");
    const value = typeof raw === "function" ? raw(args) : Array.isArray(raw) && isCollection ? select(raw, args) : raw;
    return value === undefined ? emptyValue(info.returnType, `${info.parentType.name}.${info.fieldName}`) : value;
  };

  const typeResolver: GraphQLTypeResolver<any, unknown> = (value, _ctx, _info, abstractType) =>
    value?.__typename ?? schema.getPossibleTypes(abstractType)[0].name;

  const document = parse(body.query);
  // A merged batch carries the first request's operationName on an anonymous operation; use it only to select.
  const operationCount = document.definitions.filter((d) => d.kind === "OperationDefinition").length;

  return execute({
    schema,
    document,
    variableValues: body.variables,
    operationName: operationCount > 1 ? body.operationName : undefined,
    rootValue: {},
    fieldResolver,
    typeResolver,
  }) as ExecutionResult;
};
