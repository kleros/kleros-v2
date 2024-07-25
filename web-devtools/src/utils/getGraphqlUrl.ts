import { arbitrumSepolia, arbitrum } from "wagmi/chains";

import { DEFAULT_CHAIN } from "../consts/chains";

export const getGraphqlUrl = (isDisputeTemplate = false, chainId: number = DEFAULT_CHAIN) => {
  const CHAINID_TO_DISPUTE_TEMPLATE_SUBGRAPH: { [key: number]: string } = {
    [arbitrumSepolia.id]:
      process.env.NEXT_PUBLIC_DRT_ARBSEPOLIA_SUBGRAPH ??
      "Environment variable NEXT_PUBLIC_DRT_ARBSEPOLIA_SUBGRAPH not set.",
    [arbitrum.id]:
      process.env.NEXT_PUBLIC_DRT_ARBMAINNET_SUBGRAPH ??
      "Environment variable NEXT_PUBLIC_DRT_ARBMAINNET_SUBGRAPH not set.",
  };
  const coreUrl = process.env.NEXT_PUBLIC_CORE_SUBGRAPH ?? "Environment variables NEXT_PUBLIC_CORE_SUBGRAPH not set.";
  return isDisputeTemplate ? CHAINID_TO_DISPUTE_TEMPLATE_SUBGRAPH[chainId] : coreUrl;
};
