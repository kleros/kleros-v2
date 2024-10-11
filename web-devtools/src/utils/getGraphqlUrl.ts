import { arbitrumSepolia, arbitrum } from "wagmi/chains";

import { DEFAULT_CHAIN } from "../consts/chains";

const throwIfNotSet = (key: string, value: string | undefined) => {
  if (!value) throw new Error(`${key} not set.`);
  return value;
};

// Warning: we cannot access process.env[key] with key a variable
// because of the way Next.js handles env variables, unless hacking next.config
// More info: https://stackoverflow.com/questions/64152943/cant-access-process-env-values-using-dynamic-keys
export const getGraphqlUrl = (isDisputeTemplate = false, chainId: number = DEFAULT_CHAIN) => {
  if (!isDisputeTemplate) {
    return throwIfNotSet("NEXT_PUBLIC_CORE_SUBGRAPH", process.env.NEXT_PUBLIC_CORE_SUBGRAPH);
  }
  switch (chainId) {
    case arbitrumSepolia.id:
      return throwIfNotSet("NEXT_PUBLIC_DRT_ARBSEPOLIA_SUBGRAPH", process.env.NEXT_PUBLIC_DRT_ARBSEPOLIA_SUBGRAPH);
    case arbitrum.id:
      return throwIfNotSet("NEXT_PUBLIC_DRT_ARBMAINNET_SUBGRAPH", process.env.NEXT_PUBLIC_DRT_ARBMAINNET_SUBGRAPH);
    default:
      throw new Error(`Unsupported chainId: ${chainId}`);
  }
};
