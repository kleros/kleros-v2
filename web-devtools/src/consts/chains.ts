import { Chain, arbitrum, mainnet, arbitrumSepolia, gnosisChiado } from "viem/chains";

import { isProductionDeployment } from "./index";

export const SUPPORTED_CHAINS: Record<number, Chain> = {
  [isProductionDeployment() ? arbitrum.id : arbitrumSepolia.id]: isProductionDeployment() ? arbitrum : arbitrumSepolia,
};

export const QUERY_CHAINS: Record<number, Chain> = {
  [gnosisChiado.id]: gnosisChiado,
  [mainnet.id]: mainnet,
};

export const ALL_CHAINS = [...Object.values(SUPPORTED_CHAINS), ...Object.values(QUERY_CHAINS)];
export const DEFAULT_CHAIN = isProductionDeployment() ? arbitrum.id : arbitrumSepolia.id;
