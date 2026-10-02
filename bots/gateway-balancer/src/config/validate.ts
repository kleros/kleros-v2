import type { Topology } from "./schema";

/** Cross-reference checks zod cannot express. Returns every problem found; empty means valid. */
export function validateTopology(topology: Topology): string[] {
  const problems: string[] = [];
  const chainIds = new Set<number>();
  for (const chain of topology.chains) {
    if (chainIds.has(chain.id)) problems.push(`duplicate chain id ${chain.id}`);
    chainIds.add(chain.id);
  }
  const pairIds = new Set<string>();
  for (const pair of topology.pairs) {
    if (pairIds.has(pair.id)) problems.push(`duplicate pair id ${pair.id}`);
    pairIds.add(pair.id);
    if (!chainIds.has(pair.foreignChainId))
      problems.push(`pair ${pair.id}: unknown foreign chain ${pair.foreignChainId}`);
    if (!chainIds.has(pair.homeChainId)) problems.push(`pair ${pair.id}: unknown home chain ${pair.homeChainId}`);
    if (pair.foreignChainId === pair.homeChainId) problems.push(`pair ${pair.id}: foreign and home chain are the same`);
    for (const asset of pair.collectedAssets) {
      if (asset.chainId !== pair.foreignChainId) {
        problems.push(
          `pair ${pair.id}: collected asset ${asset.symbol} is on chain ${asset.chainId}, not the foreign chain`
        );
      }
    }
    if (
      pair.foreignGateway.toLowerCase() === pair.homeGateway.toLowerCase() &&
      pair.foreignChainId === pair.homeChainId
    ) {
      problems.push(`pair ${pair.id}: gateways coincide`);
    }
  }
  const routeIds = new Set<string>();
  for (const route of topology.routes) {
    if (routeIds.has(route.id)) problems.push(`duplicate route id ${route.id}`);
    routeIds.add(route.id);
    const pair = topology.pairs.find((p) => p.id === route.pairId);
    if (!pair) {
      problems.push(`route ${route.id}: unknown pair ${route.pairId}`);
      continue;
    }
    if (route.chainId !== pair.foreignChainId && route.chainId !== pair.homeChainId) {
      problems.push(`route ${route.id}: chain ${route.chainId} is neither side of pair ${pair.id}`);
    }
  }
  return problems;
}
