import * as chains from "viem/chains";

export const DEFAULT_CHAIN = chains.arbitrumSepolia.id;

export const SUPPORTED_CHAINS: Record<number, chains.Chain> = {
  [chains.arbitrumSepolia.id]: chains.arbitrumSepolia,
};
export const SUPPORTED_CHAIN_IDS = Object.keys(SUPPORTED_CHAINS);

export const QUERY_CHAINS: Record<number, chains.Chain> = {
  [chains.gnosisChiado.id]: chains.gnosisChiado,
};
export const QUERY_CHAIN_IDS = Object.keys(QUERY_CHAINS);

export const getChain = (chainId: number): chains.Chain | null => {
  for (const chain of Object.values(chains)) {
    if (chain.id === chainId) {
      return chain;
    }
  }
  return null;
};
