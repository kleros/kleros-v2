import { type PublicClient, type WalletClient, getContract } from "viem";
import { type ContractConfig, type DeploymentName, deployments, getAddress } from "./utils";
import {
  klerosCoreConfig as devnetCoreConfig,
  sortitionModuleConfig as devnetSortitionConfig,
  disputeKitClassicConfig as devnetDkClassicConfig,
  disputeKitShutterConfig as devnetDkShutterConfig,
  disputeKitGatedConfig as devnetDkGatedConfig,
  disputeKitGatedShutterConfig as devnetDkGatedShutterConfig,
  disputeKitGatedArgentinaConsumerProtectionConfig as devnetDkGatedArgentinaConsumerProtectionConfig,
  leaderboardOffsetConfig as devnetLeaderboardOffsetConfig,
  disputeTemplateRegistryConfig as devnetDtrConfig,
  evidenceModuleConfig as devnetEvidenceConfig,
  policyRegistryConfig as devnetPolicyRegistryConfig,
  transactionBatcherConfig as devnetBatcherConfig,
  chainlinkRngConfig as devnetChainlinkRngConfig,
  rngWithFallbackConfig as devnetRngWithFallbackConfig,
  pnkConfig as devnetPnkConfig,
  klerosCoreSnapshotProxyConfig as devnetSnapshotProxyConfig,
  disputeResolverConfig as devnetDrConfig,
  // University
  klerosCoreUniversityConfig as devnetCoreUniversityConfig,
  sortitionModuleUniversityConfig as devnetSortitionUniversityConfig,
  disputeKitClassicUniversityConfig as devnetDkClassicUniversityConfig,
  disputeTemplateRegistryUniversityConfig as devnetDtrUniversityConfig,
  disputeResolverUniversityConfig as devnetDrUniversityConfig,
} from "./devnet.viem";
import {
  klerosCoreConfig as testnetCoreConfig,
  sortitionModuleConfig as testnetSortitionConfig,
  disputeKitClassicConfig as testnetDkClassicConfig,
  disputeKitShutterConfig as testnetDkShutterConfig,
  disputeKitGatedConfig as testnetDkGatedConfig,
  disputeKitGatedShutterConfig as testnetDkGatedShutterConfig,
  // disputeKitGatedArgentinaConsumerProtectionConfig as testnetDkGatedArgentinaConsumerProtectionConfig,
  disputeResolverConfig as testnetDrConfig,
  disputeTemplateRegistryConfig as testnetDtrConfig,
  evidenceModuleConfig as testnetEvidenceConfig,
  policyRegistryConfig as testnetPolicyRegistryConfig,
  transactionBatcherConfig as testnetBatcherConfig,
  chainlinkRngConfig as testnetChainlinkRngConfig,
  pnkConfig as testnetPnkConfig,
  klerosCoreSnapshotProxyConfig as testnetSnapshotProxyConfig,
  // leaderboardOffsetConfig as testnetLeaderboardOffsetConfig,
} from "./testnet.viem";
import {
  klerosCoreConfig as mainnetCoreConfig,
  sortitionModuleConfig as mainnetSortitionConfig,
  disputeKitClassicConfig as mainnetDkClassicConfig,
  disputeKitShutterConfig as mainnetDkShutterConfig,
  disputeKitGatedConfig as mainnetDkGatedConfig,
  disputeKitGatedShutterConfig as mainnetDkGatedShutterConfig,
  // disputeKitGatedArgentinaConsumerProtectionConfig as mainnetDkGatedArgentinaConsumerProtectionConfig,
  disputeResolverConfig as mainnetDrConfig,
  disputeTemplateRegistryConfig as mainnetDtrConfig,
  evidenceModuleConfig as mainnetEvidenceConfig,
  policyRegistryConfig as mainnetPolicyRegistryConfig,
  transactionBatcherConfig as mainnetBatcherConfig,
  chainlinkRngConfig as mainnetChainlinkRngConfig,
  randomizerRngConfig as mainnetRandomizerRngConfig,
  pnkConfig as mainnetPnkConfig,
  klerosCoreSnapshotProxyConfig as mainnetSnapshotProxyConfig,
  // leaderboardOffsetConfig as mainnetLeaderboardOffsetConfig,
} from "./mainnet.viem";

type ContractInstance = {
  address: `0x${string}`;
  abi: readonly any[];
};

function getContractConfig({ config, chainId }: { config: ContractConfig; chainId: number }): ContractInstance {
  return {
    address: getAddress(config, chainId),
    abi: config.abi,
  };
}

type ContractInstances = {
  klerosCore: ContractInstance;
  sortition: ContractInstance;
  disputeKitClassic: ContractInstance;
  disputeKitShutter?: ContractInstance;
  disputeKitGated?: ContractInstance;
  disputeKitGatedShutter?: ContractInstance;
  disputeKitGatedArgentinaConsumerProtection?: ContractInstance;
  disputeResolver: ContractInstance;
  disputeTemplateRegistry: ContractInstance;
  evidence: ContractInstance;
  policyRegistry: ContractInstance;
  transactionBatcher: ContractInstance;
  chainlinkRng?: ContractInstance;
  randomizerRng?: ContractInstance;
  rngWithFallback?: ContractInstance;
  pnk: ContractInstance;
  klerosCoreSnapshotProxy: ContractInstance;
  leaderboardOffset?: ContractInstance;
};

function getCommonConfigs({
  chainId,
  configs,
}: {
  chainId: number;
  configs: {
    klerosCore: ContractConfig;
    sortition: ContractConfig;
    disputeKitClassic: ContractConfig;
    disputeKitShutter?: ContractConfig;
    disputeKitGated?: ContractConfig;
    disputeKitGatedShutter?: ContractConfig;
    disputeKitGatedArgentinaConsumerProtection?: ContractConfig;
    disputeResolver: ContractConfig;
    disputeTemplateRegistry: ContractConfig;
    evidence: ContractConfig;
    policyRegistry: ContractConfig;
    transactionBatcher: ContractConfig;
    rngWithFallback?: ContractConfig;
    pnk: ContractConfig;
    klerosCoreSnapshotProxy: ContractConfig;
    leaderboardOffset?: ContractConfig;
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
    pnk: getContractConfig({ config: configs.pnk, chainId }),
    klerosCoreSnapshotProxy: getContractConfig({ config: configs.klerosCoreSnapshotProxy, chainId }),
  };

  if (configs.disputeKitShutter)
    base.disputeKitShutter = getContractConfig({ config: configs.disputeKitShutter, chainId });

  if (configs.disputeKitGated) base.disputeKitGated = getContractConfig({ config: configs.disputeKitGated, chainId });

  if (configs.disputeKitGatedShutter)
    base.disputeKitGatedShutter = getContractConfig({ config: configs.disputeKitGatedShutter, chainId });

  if (configs.disputeKitGatedArgentinaConsumerProtection)
    base.disputeKitGatedArgentinaConsumerProtection = getContractConfig({
      config: configs.disputeKitGatedArgentinaConsumerProtection,
      chainId,
    });

  if (configs.chainlinkRng) base.chainlinkRng = getContractConfig({ config: configs.chainlinkRng, chainId });

  if (configs.rngWithFallback) base.rngWithFallback = getContractConfig({ config: configs.rngWithFallback, chainId });

  if (configs.randomizerRng) base.randomizerRng = getContractConfig({ config: configs.randomizerRng, chainId });

  if (configs.leaderboardOffset)
    base.leaderboardOffset = getContractConfig({ config: configs.leaderboardOffset, chainId });

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
          disputeKitClassic: devnetDkClassicConfig,
          disputeKitShutter: devnetDkShutterConfig,
          disputeKitGated: devnetDkGatedConfig,
          disputeKitGatedShutter: devnetDkGatedShutterConfig,
          disputeKitGatedArgentinaConsumerProtection: devnetDkGatedArgentinaConsumerProtectionConfig,
          disputeResolver: devnetDrConfig,
          disputeTemplateRegistry: devnetDtrConfig,
          evidence: devnetEvidenceConfig,
          policyRegistry: devnetPolicyRegistryConfig,
          transactionBatcher: devnetBatcherConfig,
          rngWithFallback: devnetRngWithFallbackConfig,
          pnk: devnetPnkConfig,
          klerosCoreSnapshotProxy: devnetSnapshotProxyConfig,
          leaderboardOffset: devnetLeaderboardOffsetConfig,
          chainlinkRng: devnetChainlinkRngConfig,
        },
      });

    case "university":
      return {
        klerosCore: getContractConfig({ config: devnetCoreUniversityConfig, chainId }),
        sortition: getContractConfig({ config: devnetSortitionUniversityConfig, chainId }),
        disputeKitClassic: getContractConfig({ config: devnetDkClassicUniversityConfig, chainId }),
        disputeResolver: getContractConfig({ config: devnetDrUniversityConfig, chainId }),
        disputeTemplateRegistry: getContractConfig({ config: devnetDtrUniversityConfig, chainId }),
        evidence: getContractConfig({ config: devnetEvidenceConfig, chainId }), // Not arbitrator specific
        policyRegistry: getContractConfig({ config: devnetPolicyRegistryConfig, chainId }), // Not arbitrator specific
        transactionBatcher: getContractConfig({ config: devnetBatcherConfig, chainId }), // Not arbitrator specific
        pnk: getContractConfig({ config: devnetPnkConfig, chainId }), // Not arbitrator specific
        klerosCoreSnapshotProxy: getContractConfig({ config: devnetSnapshotProxyConfig, chainId }), // Not used in university
      };

    case "testnet":
      return getCommonConfigs({
        chainId,
        configs: {
          klerosCore: testnetCoreConfig,
          sortition: testnetSortitionConfig,
          disputeKitClassic: testnetDkClassicConfig,
          disputeKitShutter: testnetDkShutterConfig,
          disputeKitGated: testnetDkGatedConfig,
          disputeKitGatedShutter: testnetDkGatedShutterConfig,
          // disputeKitGatedArgentinaConsumerProtectionConfig: testnetDkGatedArgentinaConsumerProtectionConfig,
          disputeResolver: testnetDrConfig,
          disputeTemplateRegistry: testnetDtrConfig,
          evidence: testnetEvidenceConfig,
          policyRegistry: testnetPolicyRegistryConfig,
          transactionBatcher: testnetBatcherConfig,
          pnk: testnetPnkConfig,
          klerosCoreSnapshotProxy: testnetSnapshotProxyConfig,
          // leaderboardOffsetConfig: testnetLeaderboardOffsetConfig,
          chainlinkRng: testnetChainlinkRngConfig,
        },
      });

    case "mainnet":
      return getCommonConfigs({
        chainId,
        configs: {
          klerosCore: mainnetCoreConfig,
          sortition: mainnetSortitionConfig,
          disputeKitClassic: mainnetDkClassicConfig,
          disputeKitShutter: mainnetDkShutterConfig,
          disputeKitGated: mainnetDkGatedConfig,
          disputeKitGatedShutter: mainnetDkGatedShutterConfig,
          // disputeKitGatedArgentinaConsumerProtectionConfig: mainnetDkGatedArgentinaConsumerProtectionConfig,
          disputeResolver: mainnetDrConfig,
          disputeTemplateRegistry: mainnetDtrConfig,
          evidence: mainnetEvidenceConfig,
          policyRegistry: mainnetPolicyRegistryConfig,
          transactionBatcher: mainnetBatcherConfig,
          pnk: mainnetPnkConfig,
          klerosCoreSnapshotProxy: mainnetSnapshotProxyConfig,
          // leaderboardOffsetConfig: mainnetLeaderboardOffsetConfig,
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
  const disputeKitShutter = contractConfigs.disputeKitShutter
    ? getContract({
        ...contractConfigs.disputeKitShutter,
        ...clientConfig,
      })
    : undefined;
  const disputeKitGated = contractConfigs.disputeKitGated
    ? getContract({
        ...contractConfigs.disputeKitGated,
        ...clientConfig,
      })
    : undefined;
  const disputeKitGatedShutter = contractConfigs.disputeKitGatedShutter
    ? getContract({
        ...contractConfigs.disputeKitGatedShutter,
        ...clientConfig,
      })
    : undefined;
  const disputeKitGatedArgentinaConsumerProtection = contractConfigs.disputeKitGatedArgentinaConsumerProtection
    ? getContract({
        ...contractConfigs.disputeKitGatedArgentinaConsumerProtection,
        ...clientConfig,
      })
    : undefined;
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
  const rngWithFallback = contractConfigs.rngWithFallback
    ? getContract({
        ...contractConfigs.rngWithFallback,
        ...clientConfig,
      })
    : undefined;
  const pnk = getContract({
    ...contractConfigs.pnk,
    ...clientConfig,
  });
  const klerosCoreSnapshotProxy = getContract({
    ...contractConfigs.klerosCoreSnapshotProxy,
    ...clientConfig,
  });
  const leaderboardOffset = contractConfigs.leaderboardOffset
    ? getContract({
        ...contractConfigs.leaderboardOffset,
        ...clientConfig,
      })
    : undefined;
  return {
    klerosCore,
    sortition,
    disputeKitClassic,
    disputeKitShutter,
    disputeKitGated,
    disputeKitGatedShutter,
    disputeKitGatedArgentinaConsumerProtection,
    disputeResolver,
    disputeTemplateRegistry,
    evidence,
    policyRegistry,
    transactionBatcher,
    chainlinkRng,
    randomizerRng,
    rngWithFallback,
    pnk,
    klerosCoreSnapshotProxy,
    leaderboardOffset,
  };
};
