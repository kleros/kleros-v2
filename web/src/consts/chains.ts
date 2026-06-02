import {
  type AppKitNetwork,
  arbitrum,
  base,
  mainnet,
  optimism,
  arbitrumSepolia,
  gnosis,
  gnosisChiado,
  hardhat,
} from "@reown/appkit/networks";

import { klerosCoreAddress } from "hooks/contracts/generated";

import { isLocalDeployment, isProductionDeployment } from "./index";

export type SupportedChainId = keyof typeof klerosCoreAddress;

export const DEFAULT_CHAIN = (
  isLocalDeployment() ? hardhat : isProductionDeployment() ? arbitrum : arbitrumSepolia
) as AppKitNetwork & { id: SupportedChainId };

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

// Chains required by ethereum-identity-kit for EFP follow transactions
const EFP_CHAINS: Record<number, AppKitNetwork> = {
  [base.id]: base,
  [optimism.id]: optimism,
};

export const ALL_CHAINS = [
  ...Object.values(SUPPORTED_CHAINS),
  ...Object.values(QUERY_CHAINS),
  ...Object.values(EFP_CHAINS),
];

export const getChain = (chainId: number) => ALL_CHAINS.find((chain) => Number(chain.id) === chainId);
