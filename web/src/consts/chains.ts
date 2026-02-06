import {
  type AppKitNetwork,
  arbitrum,
  mainnet,
  arbitrumSepolia,
  gnosis,
  gnosisChiado,
  hardhat,
} from "@reown/appkit/networks";

import { isLocalDeployment, isProductionDeployment } from "./index";

export const DEFAULT_CHAIN = isLocalDeployment() ? hardhat : isProductionDeployment() ? arbitrum : arbitrumSepolia;

const getSupportedChains = (): Record<number, AppKitNetwork> => {
  if (isLocalDeployment()) {
    return {
      [hardhat.id]: hardhat,
    };
  }

  if (isProductionDeployment()) {
    return {
      [arbitrum.id]: arbitrum,
    };
  }

  return {
    [arbitrumSepolia.id]: arbitrumSepolia,
  };
};
// Read/Write
export const SUPPORTED_CHAINS = getSupportedChains();

const gnosisChain = isProductionDeployment() ? gnosis : gnosisChiado;
// Read Only
export const QUERY_CHAINS: Record<number, AppKitNetwork> = {
  [gnosisChain.id]: gnosisChain,
  [mainnet.id]: mainnet,
};

export const ALL_CHAINS = [...Object.values(SUPPORTED_CHAINS), ...Object.values(QUERY_CHAINS)];

export const getChain = (chainId: number) => ALL_CHAINS.find((chain) => Number(chain.id) === chainId);
