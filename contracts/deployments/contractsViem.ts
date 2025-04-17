import { arbitrum, arbitrumSepolia } from "viem/chains";
import { disputeTemplateRegistryConfig as devnetDtrConfig, klerosCoreConfig as devnetCoreConfig } from "./devnet.viem";
import {
  disputeTemplateRegistryConfig as mainnetDtrConfig,
  klerosCoreNeoConfig as mainnetCoreConfig,
} from "./mainnet.viem";
import { type PublicClient, type WalletClient } from "viem";

export const Cores = {
  BASE: "BASE",
  NEO: "NEO",
  UNIVERSITY: "UNIVERSITY",
} as const;

export type Core = (typeof Cores)[keyof typeof Cores];

export const getContracts = ({
  publicClient,
  walletClient,
  chainId,
  coreType,
}: {
  publicClient: PublicClient;
  walletClient?: WalletClient;
  chainId: number;
  coreType: Core;
}) => {
  throw new Error("Not implemented");
  switch (chainId) {
    case arbitrum.id:
      return {
        disputeTemplateRegistry: {
          address: mainnetDtrConfig.address[chainId],
          publicClient,
          walletClient,
          abi: mainnetDtrConfig.abi,
        },
        klerosCore: {
          address: mainnetCoreConfig.address[chainId],
          publicClient,
          walletClient,
          abi: mainnetCoreConfig.abi,
        },
      };
    case arbitrumSepolia.id:
      return {
        disputeTemplateRegistry: {
          address: devnetDtrConfig.address[chainId],
          publicClient,
          walletClient,
          abi: devnetDtrConfig.abi,
        },
        klerosCore: {
          address: devnetCoreConfig.address[chainId],
          publicClient,
          walletClient,
          abi: devnetCoreConfig.abi,
        },
      };
    default:
      throw new Error(`Unsupported chainId: ${chainId}`);
  }
};

// TODO: do the same for Viem ?
