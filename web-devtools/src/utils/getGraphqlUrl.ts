import { arbitrumSepolia, arbitrum } from "wagmi/chains";

import { DEFAULT_CHAIN } from "../consts/chains";

function assertEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} not set`);
  }
  return value;
}

export function getGraphqlUrl(isDisputeTemplate = false, chainId: number = DEFAULT_CHAIN) {
  const coreSubgraphEnvVar = "NEXT_PUBLIC_CORE_SUBGRAPH";
  const drtArbSepoliaSubgraphEnvVar = "NEXT_PUBLIC_DRT_ARBSEPOLIA_SUBGRAPH";
  const drtArbMainnetSubgraphEnvVar = "NEXT_PUBLIC_DRT_ARBMAINNET_SUBGRAPH";

  const chainIdToDrtSubgraph: { [key: number]: string } = {
    [arbitrumSepolia.id]: drtArbSepoliaSubgraphEnvVar,
    [arbitrum.id]: drtArbMainnetSubgraphEnvVar,
  };

  return assertEnvVar(isDisputeTemplate ? chainIdToDrtSubgraph[chainId] : coreSubgraphEnvVar);
}
