import { cacheExchange, Client, fetchExchange, type Exchange } from "@urql/core";

// A map to cache Urql Client instances by their endpoint URL.
const clients = new Map<string, Client>();

/**
 * Retrieves or creates an Urql Client instance for a given GraphQL endpoint.
 * Client instances are cached based on their endpoint URL to avoid redundant
 * client creation and to leverage Urql's caching mechanisms more effectively.
 *
 * This function is intended for internal use within the SDK's request modules.
 *
 * @param {string} endpoint - The GraphQL endpoint URL for which to get the client.
 * @returns {Client} An Urql Client instance configured for the specified endpoint.
 *                   The client uses `cacheExchange` for caching query results and
 *                   `fetchExchange` for making HTTP requests.
 *
 * @example
 * // Internal usage:
 * // import getClient from './gqlClient';
 * // const coreSubgraphClient = getClient('https://your-core-subgraph-endpoint.com/graphql');
 * // const result = await coreSubgraphClient.query(YOUR_QUERY, YOUR_VARIABLES).toPromise();
 */
const getClient = (endpoint: string): Client => {
  let client = clients.get(endpoint);

  if (!client) {
    client = new Client({
      url: endpoint,
      exchanges: [cacheExchange, fetchExchange].filter(Boolean) as Exchange[], // Ensure exchanges are correctly typed
    });
    clients.set(endpoint, client);
  }
  return client;
};

export default getClient;
