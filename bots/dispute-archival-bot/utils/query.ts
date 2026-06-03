import { getEnvConfig } from "../config";
import type { GraphQLResponse } from "./types";

const SUBGRAPH_PAGE_SIZE = 1000;

export async function querySubgraph<T>(
  queryName: string,
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const config = getEnvConfig();

  const response = await fetch(config.coreSubgraphUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`${queryName}: fetch request failed.`);
  }

  const json = (await response.json()) as GraphQLResponse<T>;

  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }

  if (!json.data) {
    throw new Error(`${queryName}: fetch request did not return any data.`);
  }

  return json.data;
}

export async function paginatedSubgraphQuery<TItem>(
  queryName: string,
  query: string,
  key: string,
  variables: Record<string, unknown>
) {
  const results: TItem[] = [];
  let skip = 0;

  while (true) {
    const data = await querySubgraph<Record<string, TItem[]>>(queryName, query, {
      ...variables,
      first: SUBGRAPH_PAGE_SIZE,
      skip,
    });
    const page = data[key];

    if (!page) {
      throw new Error(`${queryName}: missing key "${key}" in response.`);
    }

    results.push(...page);

    if (page.length < SUBGRAPH_PAGE_SIZE) {
      break;
    }

    skip += SUBGRAPH_PAGE_SIZE;
  }

  return results;
}
