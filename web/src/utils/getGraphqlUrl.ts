import { arbitrumSepolia, arbitrum } from "wagmi/chains";
import { DEFAULT_CHAIN } from "src/consts/chains";

const CHAINID_TO_DISPUTE_TEMPLATE_SUBGRAPH = {
  [arbitrumSepolia.id]:
    process.env.REACT_APP_DRT_ARBSEPOLIA_SUBGRAPH ?? "Wrong Subgraph URL. Please check the environment variables.",
  [arbitrum.id]:
    process.env.REACT_APP_DRT_ARBMAINNET_SUBGRAPH ?? "Wrong Subgraph URL. Please check the environment variables.",
};

export const getGraphqlUrl = (isDisputeTemplate = false, chainId: number = DEFAULT_CHAIN) => {
  const coreUrl = process.env.REACT_APP_CORE_SUBGRAPH ?? "Wrong Subgraph URL. Please check the environment variables.";
  return isDisputeTemplate ? CHAINID_TO_DISPUTE_TEMPLATE_SUBGRAPH[chainId] : coreUrl;
};
