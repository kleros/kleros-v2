import { Chain, arbitrumSepolia, gnosisChiado } from "wagmi/chains";

export const DEFAULT_CHAIN = arbitrumSepolia.id;

export const SUPPORTED_CHAINS: Record<number, Chain> = {
  [arbitrumSepolia.id]: arbitrumSepolia,
};
export const SUPPORTED_CHAIN_IDS = Object.keys(SUPPORTED_CHAINS);

export const QUERY_CHAINS: Record<number, Chain> = {
  [gnosisChiado.id]: gnosisChiado,
};
export const QUERY_CHAIN_IDS = Object.keys(QUERY_CHAINS);
