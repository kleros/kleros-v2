import { arbitrumSepolia, arbitrum } from "wagmi/chains";
import { DEFAULT_CHAIN } from "src/consts/chains";

const CHAINID_TO_DISPUTE_TEMPLATE_SUBGRAPH = {
  [arbitrumSepolia.id]:
    process.env.REACT_APP_DRT_ARBSEPOLIA_SUBGRAPH ?? "Environment variables REACT_APP_DRT_ARBSEPOLIA_SUBGRAPH not set.",
  [arbitrum.id]:
    process.env.REACT_APP_DRT_ARBMAINNET_SUBGRAPH ?? "Environment variables REACT_APP_DRT_ARBMAINNET_SUBGRAPH not set.",
};

export const getGraphqlUrl = (isDisputeTemplate = false, chainId: number = DEFAULT_CHAIN) => {
  const coreUrl = process.env.REACT_APP_CORE_SUBGRAPH ?? "Environment variables REACT_APP_CORE_SUBGRAPH not set.";
  return isDisputeTemplate ? CHAINID_TO_DISPUTE_TEMPLATE_SUBGRAPH[chainId] : coreUrl;
};
