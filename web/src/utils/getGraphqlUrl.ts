import { arbitrumSepolia, arbitrum, hardhat } from "wagmi/chains";

import { DEFAULT_CHAIN } from "consts/chains";

export const getGraphqlUrl = (isDisputeTemplate = false, chainId: number = DEFAULT_CHAIN.id) => {
  const CHAINID_TO_DISPUTE_TEMPLATE_SUBGRAPH = {
    [arbitrumSepolia.id]:
      import.meta.env.REACT_APP_DRT_ARBSEPOLIA_SUBGRAPH ??
      "Environment variable REACT_APP_DRT_ARBSEPOLIA_SUBGRAPH not set.",
    [arbitrum.id]:
      import.meta.env.REACT_APP_DRT_ARBMAINNET_SUBGRAPH ??
      "Environment variable REACT_APP_DRT_ARBMAINNET_SUBGRAPH not set.",
    [hardhat.id]:
      import.meta.env.REACT_APP_DRT_LOCAL_SUBGRAPH ?? "Environment variable REACT_APP_DRT_LOCAL_SUBGRAPH not set.",
  };
  const coreUrl = import.meta.env.REACT_APP_CORE_SUBGRAPH ?? "Environment variables REACT_APP_CORE_SUBGRAPH not set.";
  return isDisputeTemplate ? CHAINID_TO_DISPUTE_TEMPLATE_SUBGRAPH[chainId] : coreUrl;
};
