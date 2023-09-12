import { Chain, arbitrumGoerli, gnosisChiado } from "@wagmi/chains";

export const DEFAULT_CHAIN = arbitrumGoerli.id;

export const SUPPORTED_CHAINS: Record<number, Chain> = {
  [arbitrumGoerli.id]: arbitrumGoerli,
};
export const SUPPORTED_CHAIN_IDS = Object.keys(SUPPORTED_CHAINS);

export const QUERY_CHAINS: Record<number, Chain> = {
  [gnosisChiado.id]: gnosisChiado,
};
export const QUERY_CHAIN_IDS = Object.keys(QUERY_CHAINS);
