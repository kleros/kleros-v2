import {
  type AppKitNetwork,
  arbitrum,
  mainnet,
  arbitrumSepolia,
  gnosis,
  gnosisChiado,
  hardhat,
} from "@reown/appkit/networks";
import { type Chain, extractChain } from "viem";

import { isLocalDeployment, isProductionDeployment } from "./index";

export const DEFAULT_CHAIN = isLocalDeployment() ? hardhat : isProductionDeployment() ? arbitrum : arbitrumSepolia;

// Read/Write
export const SUPPORTED_CHAINS: Record<number, AppKitNetwork> = isLocalDeployment()
  ? { [hardhat.id]: hardhat }
  : {
      [isProductionDeployment() ? arbitrum.id : arbitrumSepolia.id]: isProductionDeployment()
        ? arbitrum
        : arbitrumSepolia,
    };

// Read Only
export const QUERY_CHAINS: Record<number, AppKitNetwork> = {
  [isProductionDeployment() ? gnosis.id : gnosisChiado.id]: isProductionDeployment() ? gnosis : gnosisChiado,
  [mainnet.id]: mainnet,
};

export const ALL_CHAINS = [...Object.values(SUPPORTED_CHAINS), ...Object.values(QUERY_CHAINS)];

export const SUPPORTED_CHAIN_IDS = Object.keys(SUPPORTED_CHAINS);

export const QUERY_CHAIN_IDS = Object.keys(QUERY_CHAINS);

export const getChain = (chainId: number): Chain | null =>
  extractChain({
    chains: ALL_CHAINS,
    id: chainId,
  });
