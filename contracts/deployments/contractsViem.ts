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
} from "./devnet.viem";
import {
  klerosCoreConfig as testnetCoreConfig,
  sortitionModuleConfig as testnetSortitionConfig,
  disputeKitClassicConfig as testnetDkcConfig,
  disputeResolverConfig as testnetDrConfig,
  disputeTemplateRegistryConfig as testnetDtrConfig,
  evidenceModuleConfig as testnetEvidenceConfig,
  policyRegistryConfig as testnetPolicyRegistryConfig,
  transactionBatcherConfig as testnetBatcherConfig,
  chainlinkRngConfig as testnetChainlinkRngConfig,
  blockHashRngConfig as testnetBlockHashRngConfig,
  pnkConfig as testnetPnkConfig,
  klerosCoreSnapshotProxyConfig as testnetSnapshotProxyConfig,
} from "./testnet.viem";
import {
  klerosCoreNeoConfig as mainnetCoreConfig,
  sortitionModuleNeoConfig as mainnetSortitionConfig,
  disputeKitClassicNeoConfig as mainnetDkcConfig,
  disputeResolverNeoConfig as mainnetDrConfig,
  disputeTemplateRegistryConfig as mainnetDtrConfig,
  evidenceModuleConfig as mainnetEvidenceConfig,
  policyRegistryConfig as mainnetPolicyRegistryConfig,
  transactionBatcherConfig as mainnetBatcherConfig,
  chainlinkRngConfig as mainnetChainlinkRngConfig,
  randomizerRngConfig as mainnetRandomizerRngConfig,
  blockHashRngConfig as mainnetBlockHashRngConfig,
  pnkConfig as mainnetPnkConfig,
  klerosCoreSnapshotProxyConfig as mainnetSnapshotProxyConfig,
} from "./mainnet.viem";
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

type ContractInstance = {
  address: `0x${string}`;
  abi: readonly any[];
};

type ContractInstances = {
  klerosCore: ContractInstance;
  sortition: ContractInstance;
  disputeKitClassic: ContractInstance;
  disputeResolver: ContractInstance;
  disputeTemplateRegistry: ContractInstance;
  evidence: ContractInstance;
  policyRegistry: ContractInstance;
  transactionBatcher: ContractInstance;
  chainlinkRng?: ContractInstance;
  randomizerRng?: ContractInstance;
  blockHashRng: ContractInstance;
  pnk: ContractInstance;
  klerosCoreSnapshotProxy: ContractInstance;
};

function getAddress(config: ContractConfig, chainId: number): `0x${string}` {
  const address = config.address[chainId];
  if (!address) throw new Error(`No address found for chainId ${chainId}`);
  return address;
}

function getContractConfig({ config, chainId }: { config: ContractConfig; chainId: number }): ContractInstance {
  return {
    address: getAddress(config, chainId),
    abi: config.abi,
  };
}

function getCommonConfigs({
  chainId,
  configs,
}: {
  chainId: number;
  configs: {
    klerosCore: ContractConfig;
    sortition: ContractConfig;
    disputeKitClassic: ContractConfig;
    disputeResolver: ContractConfig;
    disputeTemplateRegistry: ContractConfig;
    evidence: ContractConfig;
    policyRegistry: ContractConfig;
    transactionBatcher: ContractConfig;
    blockHashRng: ContractConfig;
    pnk: ContractConfig;
    klerosCoreSnapshotProxy: ContractConfig;
    chainlinkRng?: ContractConfig;
    randomizerRng?: ContractConfig;
  };
}): ContractInstances {
  const base: ContractInstances = {
    klerosCore: getContractConfig({ config: configs.klerosCore, chainId }),
    sortition: getContractConfig({ config: configs.sortition, chainId }),
    disputeKitClassic: getContractConfig({ config: configs.disputeKitClassic, chainId }),
    disputeResolver: getContractConfig({ config: configs.disputeResolver, chainId }),
    disputeTemplateRegistry: getContractConfig({ config: configs.disputeTemplateRegistry, chainId }),
    evidence: getContractConfig({ config: configs.evidence, chainId }),
    policyRegistry: getContractConfig({ config: configs.policyRegistry, chainId }),
    transactionBatcher: getContractConfig({ config: configs.transactionBatcher, chainId }),
    blockHashRng: getContractConfig({ config: configs.blockHashRng, chainId }),
    pnk: getContractConfig({ config: configs.pnk, chainId }),
    klerosCoreSnapshotProxy: getContractConfig({ config: configs.klerosCoreSnapshotProxy, chainId }),
  };

  if (configs.chainlinkRng) base.chainlinkRng = getContractConfig({ config: configs.chainlinkRng, chainId });

  if (configs.randomizerRng) base.randomizerRng = getContractConfig({ config: configs.randomizerRng, chainId });

  return base;
}

export const getConfigs = ({ deployment }: { deployment: DeploymentName }): ContractInstances => {
  const { chainId } = deployments[deployment];
  switch (deployment) {
    case "devnet":
      return getCommonConfigs({
        chainId,
        configs: {
          klerosCore: devnetCoreConfig,
          sortition: devnetSortitionConfig,
          disputeKitClassic: devnetDkcConfig,
          disputeResolver: devnetDrConfig,
          disputeTemplateRegistry: devnetDtrConfig,
          evidence: devnetEvidenceConfig,
          policyRegistry: devnetPolicyRegistryConfig,
          transactionBatcher: devnetBatcherConfig,
          blockHashRng: devnetBlockHashRngConfig,
          pnk: devnetPnkConfig,
          klerosCoreSnapshotProxy: devnetSnapshotProxyConfig,
          chainlinkRng: devnetChainlinkRngConfig,
        },
      });

    case "university":
      return {
        klerosCore: getContractConfig({ config: devnetCoreUniversityConfig, chainId }),
        sortition: getContractConfig({ config: devnetSortitionUniversityConfig, chainId }),
        disputeKitClassic: getContractConfig({ config: devnetDkcUniversityConfig, chainId }),
        disputeResolver: getContractConfig({ config: devnetDrUniversityConfig, chainId }),
        disputeTemplateRegistry: getContractConfig({ config: devnetDtrConfig, chainId }), // FIXME: should not be shared with devnet
        evidence: getContractConfig({ config: devnetEvidenceConfig, chainId }), // Not arbitrator specific
        policyRegistry: getContractConfig({ config: devnetPolicyRegistryConfig, chainId }), // Not arbitrator specific
        transactionBatcher: getContractConfig({ config: devnetBatcherConfig, chainId }), // Not arbitrator specific
        blockHashRng: getContractConfig({ config: devnetBlockHashRngConfig, chainId }), // Not used in university
        pnk: getContractConfig({ config: devnetPnkConfig, chainId }), // Not arbitrator specific
        klerosCoreSnapshotProxy: getContractConfig({ config: devnetSnapshotProxyConfig, chainId }), // Not used in university
      };

    case "testnet":
      return getCommonConfigs({
        chainId,
        configs: {
          klerosCore: testnetCoreConfig,
          sortition: testnetSortitionConfig,
          disputeKitClassic: testnetDkcConfig,
          disputeResolver: testnetDrConfig,
          disputeTemplateRegistry: testnetDtrConfig,
          evidence: testnetEvidenceConfig,
          policyRegistry: testnetPolicyRegistryConfig,
          transactionBatcher: testnetBatcherConfig,
          blockHashRng: testnetBlockHashRngConfig,
          pnk: testnetPnkConfig,
          klerosCoreSnapshotProxy: testnetSnapshotProxyConfig,
          chainlinkRng: testnetChainlinkRngConfig,
        },
      });

    case "mainnetNeo":
      return getCommonConfigs({
        chainId,
        configs: {
          klerosCore: mainnetCoreConfig,
          sortition: mainnetSortitionConfig,
          disputeKitClassic: mainnetDkcConfig,
          disputeResolver: mainnetDrConfig,
          disputeTemplateRegistry: mainnetDtrConfig,
          evidence: mainnetEvidenceConfig,
          policyRegistry: mainnetPolicyRegistryConfig,
          transactionBatcher: mainnetBatcherConfig,
          blockHashRng: mainnetBlockHashRngConfig,
          pnk: mainnetPnkConfig,
          klerosCoreSnapshotProxy: mainnetSnapshotProxyConfig,
          chainlinkRng: mainnetChainlinkRngConfig,
          randomizerRng: mainnetRandomizerRngConfig,
        },
      });

    default:
      throw new Error(`Unsupported deployment: ${deployment}`);
  }
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
  const contractConfigs = getConfigs({ deployment });
  const klerosCore = getContract({
    ...contractConfigs.klerosCore,
    ...clientConfig,
  });
  const sortition = getContract({
    ...contractConfigs.sortition,
    ...clientConfig,
  });
  const disputeKitClassic = getContract({
    ...contractConfigs.disputeKitClassic,
    ...clientConfig,
  });
  const disputeResolver = getContract({
    ...contractConfigs.disputeResolver,
    ...clientConfig,
  });
  const disputeTemplateRegistry = getContract({
    ...contractConfigs.disputeTemplateRegistry,
    ...clientConfig,
  });
  const evidence = getContract({
    ...contractConfigs.evidence,
    ...clientConfig,
  });
  const policyRegistry = getContract({
    ...contractConfigs.policyRegistry,
    ...clientConfig,
  });
  const transactionBatcher = getContract({
    ...contractConfigs.transactionBatcher,
    ...clientConfig,
  });
  const chainlinkRng = contractConfigs.chainlinkRng
    ? getContract({
        ...contractConfigs.chainlinkRng,
        ...clientConfig,
      })
    : undefined;
  const randomizerRng = contractConfigs.randomizerRng
    ? getContract({
        ...contractConfigs.randomizerRng,
        ...clientConfig,
      })
    : undefined;
  const blockHashRng = getContract({
    ...contractConfigs.blockHashRng,
    ...clientConfig,
  });
  const pnk = getContract({
    ...contractConfigs.pnk,
    ...clientConfig,
  });
  const klerosCoreSnapshotProxy = getContract({
    ...contractConfigs.klerosCoreSnapshotProxy,
    ...clientConfig,
  });
  return {
    klerosCore,
    sortition,
    disputeKitClassic,
    disputeResolver,
    disputeTemplateRegistry,
    evidence,
    policyRegistry,
    transactionBatcher,
    chainlinkRng,
    randomizerRng,
    blockHashRng,
    pnk,
    klerosCoreSnapshotProxy,
  };
};
