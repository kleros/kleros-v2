import { ethers } from "ethers";
import {
  klerosCoreConfig as devnetCoreConfig,
  sortitionModuleConfig as devnetSortitionConfig,
  disputeKitClassicConfig as devnetDkClassicConfig,
  disputeKitShutterConfig as devnetDkShutterConfig,
  disputeKitGatedConfig as devnetDkGatedConfig,
  disputeKitGatedShutterConfig as devnetDkGatedShutterConfig,
  disputeKitGatedArgentinaConsumerProtectionConfig as devnetDkGatedArgentinaConsumerProtectionConfig,
  disputeResolverConfig as devnetDrConfig,
  disputeTemplateRegistryConfig as devnetDtrConfig,
  evidenceModuleConfig as devnetEvidenceConfig,
  policyRegistryConfig as devnetPolicyRegistryConfig,
  transactionBatcherConfig as devnetBatcherConfig,
  chainlinkRngConfig as devnetChainlinkRngConfig,
  rngWithFallbackConfig as devnetRngWithFallbackConfig,
  pnkConfig as devnetPnkConfig,
  klerosCoreSnapshotProxyConfig as devnetSnapshotProxyConfig,
  // University
  klerosCoreUniversityConfig as devnetCoreUniversityConfig,
  sortitionModuleUniversityConfig as devnetSortitionUniversityConfig,
  disputeKitClassicUniversityConfig as devnetDkClassicUniversityConfig,
  disputeTemplateRegistryUniversityConfig as devnetDtrUniversityConfig,
  disputeResolverUniversityConfig as devnetDrUniversityConfig,
  leaderboardOffsetConfig as devnetLeaderboardOffsetConfig,
} from "./devnet.viem";
import {
  klerosCoreConfig as testnetCoreConfig,
  sortitionModuleConfig as testnetSortitionConfig,
  disputeKitClassicConfig as testnetDkcConfig,
  disputeKitShutterConfig as testnetDkShutterConfig,
  disputeKitGatedConfig as testnetDkGatedConfig,
  disputeKitGatedShutterConfig as testnetDkGatedShutterConfig,
  //disputeKitGatedArgentinaConsumerProtectionConfig as testnetDkGatedArgentinaConsumerProtectionConfig,
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
  disputeKitClassicConfig as mainnetDkcConfig,
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
import {
  KlerosCore,
  KlerosCore__factory,
  SortitionModule,
  SortitionModule__factory,
  DisputeKitClassic,
  DisputeKitClassic__factory,
  DisputeKitShutter,
  DisputeKitShutter__factory,
  DisputeKitGated,
  DisputeKitGated__factory,
  DisputeKitGatedShutter,
  DisputeKitGatedShutter__factory,
  DisputeKitGatedArgentinaConsumerProtection,
  DisputeKitGatedArgentinaConsumerProtection__factory,
  DisputeResolver,
  DisputeResolver__factory,
  DisputeTemplateRegistry,
  DisputeTemplateRegistry__factory,
  EvidenceModule,
  EvidenceModule__factory,
  PolicyRegistry,
  PolicyRegistry__factory,
  TransactionBatcher,
  TransactionBatcher__factory,
  ChainlinkRNG,
  ChainlinkRNG__factory,
  RandomizerRNG,
  RandomizerRNG__factory,
  RNGWithFallback,
  RNGWithFallback__factory,
  PNK,
  PNK__factory,
  KlerosCoreSnapshotProxy,
  KlerosCoreSnapshotProxy__factory,
  KlerosCoreUniversity,
  KlerosCoreUniversity__factory,
  SortitionModuleUniversity,
  SortitionModuleUniversity__factory,
  LeaderboardOffset,
  LeaderboardOffset__factory,
} from "../typechain-types";
import { type ContractConfig, type DeploymentName, deployments, getAddress } from "./utils";

type CommonFactoriesConfigs = {
  dkClassicConfig: ContractConfig;
  dkShutterConfig?: ContractConfig;
  dkGatedConfig?: ContractConfig;
  dkGatedShutterConfig?: ContractConfig;
  dkGatedArgentinaConsumerProtectionConfig?: ContractConfig;
  drConfig: ContractConfig;
  dtrConfig: ContractConfig;
  evidenceConfig: ContractConfig;
  policyRegistryConfig: ContractConfig;
  batcherConfig: ContractConfig;
  chainlinkRngConfig?: ContractConfig;
  randomizerRngConfig?: ContractConfig;
  rngWithFallbackConfig?: ContractConfig;
  pnkConfig: ContractConfig;
  snapshotProxyConfig: ContractConfig;
  leaderboardOffsetConfig?: ContractConfig;
};

type CommonFactories = {
  disputeKitClassic: DisputeKitClassic;
  disputeKitShutter: DisputeKitShutter | null;
  disputeKitGated: DisputeKitGated | null;
  disputeKitGatedShutter: DisputeKitGatedShutter | null;
  disputeKitGatedArgentinaConsumerProtection: DisputeKitGatedArgentinaConsumerProtection | null;
  disputeResolver: DisputeResolver;
  disputeTemplateRegistry: DisputeTemplateRegistry;
  evidence: EvidenceModule;
  policyRegistry: PolicyRegistry;
  transactionBatcher: TransactionBatcher;
  chainlinkRng: ChainlinkRNG | null;
  randomizerRng: RandomizerRNG | null;
  rngWithFallback: RNGWithFallback | null;
  pnk: PNK;
  klerosCoreSnapshotProxy: KlerosCoreSnapshotProxy;
  leaderboardOffset: LeaderboardOffset | null;
};

function getCommonFactories(
  configs: CommonFactoriesConfigs,
  provider: ethers.Provider,
  chainId: number
): CommonFactories {
  return {
    disputeKitClassic: DisputeKitClassic__factory.connect(getAddress(configs.dkClassicConfig, chainId), provider),
    disputeKitShutter: configs.dkShutterConfig
      ? DisputeKitShutter__factory.connect(getAddress(configs.dkShutterConfig, chainId), provider)
      : null,
    disputeKitGated: configs.dkGatedConfig
      ? DisputeKitGated__factory.connect(getAddress(configs.dkGatedConfig, chainId), provider)
      : null,
    disputeKitGatedShutter: configs.dkGatedShutterConfig
      ? DisputeKitGatedShutter__factory.connect(getAddress(configs.dkGatedShutterConfig, chainId), provider)
      : null,
    disputeKitGatedArgentinaConsumerProtection: configs.dkGatedArgentinaConsumerProtectionConfig
      ? DisputeKitGatedArgentinaConsumerProtection__factory.connect(
          getAddress(configs.dkGatedArgentinaConsumerProtectionConfig, chainId),
          provider
        )
      : null,
    disputeResolver: DisputeResolver__factory.connect(getAddress(configs.drConfig, chainId), provider),
    disputeTemplateRegistry: DisputeTemplateRegistry__factory.connect(getAddress(configs.dtrConfig, chainId), provider),
    evidence: EvidenceModule__factory.connect(getAddress(configs.evidenceConfig, chainId), provider),
    policyRegistry: PolicyRegistry__factory.connect(getAddress(configs.policyRegistryConfig, chainId), provider),
    transactionBatcher: TransactionBatcher__factory.connect(getAddress(configs.batcherConfig, chainId), provider),
    chainlinkRng: configs.chainlinkRngConfig
      ? ChainlinkRNG__factory.connect(getAddress(configs.chainlinkRngConfig, chainId), provider)
      : null,
    randomizerRng: configs.randomizerRngConfig
      ? RandomizerRNG__factory.connect(getAddress(configs.randomizerRngConfig, chainId), provider)
      : null,
    rngWithFallback: configs.rngWithFallbackConfig
      ? RNGWithFallback__factory.connect(getAddress(configs.rngWithFallbackConfig, chainId), provider)
      : null,
    pnk: PNK__factory.connect(getAddress(configs.pnkConfig, chainId), provider),
    klerosCoreSnapshotProxy: KlerosCoreSnapshotProxy__factory.connect(
      getAddress(configs.snapshotProxyConfig, chainId),
      provider
    ),
    leaderboardOffset: configs.leaderboardOffsetConfig
      ? LeaderboardOffset__factory.connect(getAddress(configs.leaderboardOffsetConfig, chainId), provider)
      : null,
  };
}

export const getContracts = async (provider: ethers.Provider, deployment: DeploymentName) => {
  const { chainId } = deployments[deployment];
  let klerosCore: KlerosCore | KlerosCoreUniversity;
  let sortition: SortitionModule | SortitionModuleUniversity;
  let commonFactories: CommonFactories;

  switch (deployment) {
    case "devnet": {
      klerosCore = KlerosCore__factory.connect(getAddress(devnetCoreConfig, chainId), provider);
      sortition = SortitionModule__factory.connect(getAddress(devnetSortitionConfig, chainId), provider);
      commonFactories = getCommonFactories(
        {
          dkClassicConfig: devnetDkClassicConfig,
          dkShutterConfig: devnetDkShutterConfig,
          dkGatedConfig: devnetDkGatedConfig,
          dkGatedShutterConfig: devnetDkGatedShutterConfig,
          dkGatedArgentinaConsumerProtectionConfig: devnetDkGatedArgentinaConsumerProtectionConfig,
          drConfig: devnetDrConfig,
          dtrConfig: devnetDtrConfig,
          evidenceConfig: devnetEvidenceConfig,
          policyRegistryConfig: devnetPolicyRegistryConfig,
          batcherConfig: devnetBatcherConfig,
          chainlinkRngConfig: devnetChainlinkRngConfig,
          rngWithFallbackConfig: devnetRngWithFallbackConfig,
          pnkConfig: devnetPnkConfig,
          snapshotProxyConfig: devnetSnapshotProxyConfig,
          leaderboardOffsetConfig: devnetLeaderboardOffsetConfig,
        },
        provider,
        chainId
      );
      break;
    }
    case "university": {
      klerosCore = KlerosCoreUniversity__factory.connect(getAddress(devnetCoreUniversityConfig, chainId), provider);
      sortition = SortitionModuleUniversity__factory.connect(
        getAddress(devnetSortitionUniversityConfig, chainId),
        provider
      );
      commonFactories = getCommonFactories(
        {
          dkClassicConfig: devnetDkClassicUniversityConfig,
          drConfig: devnetDrUniversityConfig,
          dtrConfig: devnetDtrUniversityConfig,
          evidenceConfig: devnetEvidenceConfig,
          policyRegistryConfig: devnetPolicyRegistryConfig,
          batcherConfig: devnetBatcherConfig,
          chainlinkRngConfig: devnetChainlinkRngConfig,
          pnkConfig: devnetPnkConfig,
          snapshotProxyConfig: devnetSnapshotProxyConfig,
        },
        provider,
        chainId
      );
      break;
    }
    case "testnet":
      klerosCore = KlerosCore__factory.connect(getAddress(testnetCoreConfig, chainId), provider);
      sortition = SortitionModule__factory.connect(getAddress(testnetSortitionConfig, chainId), provider);
      commonFactories = getCommonFactories(
        {
          dkClassicConfig: testnetDkcConfig,
          dkShutterConfig: testnetDkShutterConfig,
          dkGatedConfig: testnetDkGatedConfig,
          dkGatedShutterConfig: testnetDkGatedShutterConfig,
          // dkGatedArgentinaConsumerProtectionConfig: testnetDkGatedArgentinaConsumerProtectionConfig,
          drConfig: testnetDrConfig,
          dtrConfig: testnetDtrConfig,
          evidenceConfig: testnetEvidenceConfig,
          policyRegistryConfig: testnetPolicyRegistryConfig,
          batcherConfig: testnetBatcherConfig,
          chainlinkRngConfig: testnetChainlinkRngConfig,
          pnkConfig: testnetPnkConfig,
          snapshotProxyConfig: testnetSnapshotProxyConfig,
          // leaderboardOffsetConfig: testnetLeaderboardOffsetConfig,
        },
        provider,
        chainId
      );
      break;
    case "mainnet":
      klerosCore = KlerosCore__factory.connect(getAddress(mainnetCoreConfig, chainId), provider);
      sortition = SortitionModule__factory.connect(getAddress(mainnetSortitionConfig, chainId), provider);
      commonFactories = getCommonFactories(
        {
          dkClassicConfig: mainnetDkcConfig,
          dkShutterConfig: mainnetDkShutterConfig,
          dkGatedConfig: mainnetDkGatedConfig,
          dkGatedShutterConfig: mainnetDkGatedShutterConfig,
          // dkGatedArgentinaConsumerProtectionConfig: mainnetDkGatedArgentinaConsumerProtectionConfig,
          drConfig: mainnetDrConfig,
          dtrConfig: mainnetDtrConfig,
          evidenceConfig: mainnetEvidenceConfig,
          policyRegistryConfig: mainnetPolicyRegistryConfig,
          batcherConfig: mainnetBatcherConfig,
          chainlinkRngConfig: mainnetChainlinkRngConfig,
          randomizerRngConfig: mainnetRandomizerRngConfig,
          pnkConfig: mainnetPnkConfig,
          snapshotProxyConfig: mainnetSnapshotProxyConfig,
          // leaderboardOffsetConfig: mainnetLeaderboardOffsetConfig,
        },
        provider,
        chainId
      );
      break;
    default:
      throw new Error(`Unsupported deployment: ${deployment}`);
  }
  return { klerosCore, sortition, ...commonFactories };
};
