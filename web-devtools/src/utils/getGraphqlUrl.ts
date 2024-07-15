import { arbitrumSepolia, arbitrum } from "wagmi/chains";

import { DEFAULT_CHAIN } from "../consts/chains";

export const getGraphqlUrl = (isDisputeTemplate = false, chainId: number = DEFAULT_CHAIN) => {
  const CHAINID_TO_DISPUTE_TEMPLATE_SUBGRAPH: { [key: number]: string } = {
    [arbitrumSepolia.id]: "https://api.studio.thegraph.com/query/61738/kleros-v2-drt-arbisep-devnet/version/latest",
    [arbitrum.id]: "https://api.studio.thegraph.com/query/61738/kleros-v2-drt-arbisep-devnet/version/latest",
  };
  const coreUrl = "https://api.studio.thegraph.com/query/61738/kleros-v2-core-devnet/version/latest";
  return isDisputeTemplate ? CHAINID_TO_DISPUTE_TEMPLATE_SUBGRAPH[chainId] : coreUrl;
};
