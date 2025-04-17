import { arbitrum, arbitrumSepolia } from "viem/chains";
import {
  klerosCoreConfig as devnetCoreConfig,
  sortitionModuleConfig as devnetSortitionConfig,
  disputeKitClassicConfig as devnetDkcConfig,
  disputeResolverConfig as devnetDrConfig,
  disputeTemplateRegistryConfig as devnetDtrConfig,
  evidenceModuleConfig as devnetEvidenceConfig,
  policyRegistryConfig as devnetPolicyRegistryConfig,
  transactionBatcherConfig as devnetBatcherConfig,
  chainlinkRngConfig as devnetChainlinkRngConfig,
  blockHashRngConfig as devnetBlockHashRngConfig,
  pnkConfig as devnetPnkConfig,
  klerosCoreSnapshotProxyConfig as devnetSnapshotProxyConfig,
  klerosCoreUniversityConfig as devnetCoreUniversityConfig,
  sortitionModuleUniversityConfig as devnetSortitionUniversityConfig,
  disputeKitClassicUniversityConfig as devnetDkcUniversityConfig,
  disputeResolverUniversityConfig as devnetDrUniversityConfig,
  klerosCoreUniversityProxyConfig as devnetCoreUniversityProxyConfig,
} from "./devnet.viem";
import { type PublicClient, type WalletClient, getContract } from "viem";

const deployments = {
  devnet: {
    chainId: arbitrumSepolia.id,
  },
  university: {
    chainId: arbitrumSepolia.id,
  },
  testnet: {
    chainId: arbitrumSepolia.id,
  },
  mainnetNeo: {
    chainId: arbitrum.id,
  },
} as const;

type DeploymentName = keyof typeof deployments;

type ContractConfig = {
  address: Record<number, `0x${string}`>;
  abi: readonly any[];
};

type ContractConfigs = {
  klerosCore?: {
    address: `0x${string}`;
    abi: readonly any[];
  };
};

function getAddress(config: ContractConfig, chainId: number): `0x${string}` {
  const address = config.address[chainId];
  if (!address) throw new Error(`No address found for chainId ${chainId}`);
  return address;
}

export const getConfigs = ({ deployment }: { deployment: DeploymentName }): ContractConfigs => {
  const { chainId } = deployments[deployment];
  let contractConfigs: ContractConfigs = {};
  switch (deployment) {
    case "devnet":
      contractConfigs = {
        klerosCore: {
          address: getAddress(devnetCoreConfig, chainId),
          abi: devnetCoreConfig.abi,
        },
      };
      break;
    default:
      throw new Error(`Unsupported deployment: ${deployment}`);
  }
  return contractConfigs;
};

export const getContracts = ({
  publicClient,
  walletClient,
  deployment,
}: {
  publicClient: PublicClient;
  walletClient?: WalletClient;
  deployment: DeploymentName;
}) => {
  const clientConfig = {
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  };
  let klerosCore;
  switch (deployment) {
    case "devnet":
      const contractConfigs = getConfigs({ deployment });
      if (!contractConfigs.klerosCore) throw new Error("KlerosCore config not found");
      klerosCore = getContract({
        ...contractConfigs.klerosCore,
        ...clientConfig,
      });
      break;
    default:
      throw new Error(`Unsupported deployment: ${deployment}`);
  }
  return {
    klerosCore,
  };
};
