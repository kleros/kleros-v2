import { Chain, arbitrum, arbitrumSepolia, gnosisChiado } from "wagmi/chains";
import { isProductionDeployment } from ".";

export const DEFAULT_CHAIN = isProductionDeployment() ? arbitrum.id : arbitrumSepolia.id;

export const SUPPORTED_CHAINS: Record<number, Chain> = {
  [arbitrumSepolia.id]: arbitrumSepolia,
  [arbitrum.id]: arbitrum,
};
export const SUPPORTED_CHAIN_IDS = Object.keys(SUPPORTED_CHAINS);

export const QUERY_CHAINS: Record<number, Chain> = {
  [gnosisChiado.id]: gnosisChiado,
};
export const QUERY_CHAIN_IDS = Object.keys(QUERY_CHAINS);
