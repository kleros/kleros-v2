import { Chain, mainnet, arbitrumSepolia, gnosisChiado } from "viem/chains";

export const SUPPORTED_CHAINS: Record<number, Chain> = {
  [arbitrumSepolia.id]: arbitrumSepolia,
};

export const QUERY_CHAINS: Record<number, Chain> = {
  [gnosisChiado.id]: gnosisChiado,
  [mainnet.id]: mainnet,
};

export const ALL_CHAINS = [...Object.values(SUPPORTED_CHAINS), ...Object.values(QUERY_CHAINS)];
export const DEFAULT_CHAIN = arbitrumSepolia.id;
