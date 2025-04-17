import { ethers } from "ethers";
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
import {
  KlerosCore,
  KlerosCore__factory,
  SortitionModule,
  SortitionModule__factory,
  DisputeKitClassic,
  DisputeKitClassic__factory,
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
  BlockHashRNG,
  BlockHashRNG__factory,
  PNK,
  PNK__factory,
  KlerosCoreSnapshotProxy,
  KlerosCoreSnapshotProxy__factory,
  KlerosCoreUniversity,
  KlerosCoreUniversity__factory,
  SortitionModuleUniversity,
  SortitionModuleUniversity__factory,
  KlerosCoreNeo,
  KlerosCoreNeo__factory,
  SortitionModuleNeo,
  SortitionModuleNeo__factory,
} from "../typechain-types";

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

function getAddress(config: ContractConfig, chainId: number): `0x${string}` {
  const address = config.address[chainId];
  if (!address) throw new Error(`No address found for chainId ${chainId}`);
  return address;
}

type CommonFactoriesConfigs = {
  dkcConfig: ContractConfig;
  drConfig: ContractConfig;
  dtrConfig: ContractConfig;
  evidenceConfig: ContractConfig;
  policyRegistryConfig: ContractConfig;
  batcherConfig: ContractConfig;
  chainlinkRngConfig?: ContractConfig;
  randomizerRngConfig?: ContractConfig;
  blockHashRngConfig: ContractConfig;
  pnkConfig: ContractConfig;
  snapshotProxyConfig: ContractConfig;
};

type CommonFactories = {
  disputeKitClassic: DisputeKitClassic;
  disputeResolver: DisputeResolver;
  disputeTemplateRegistry: DisputeTemplateRegistry;
  evidence: EvidenceModule;
  policyRegistry: PolicyRegistry;
  transactionBatcher: TransactionBatcher;
  chainlinkRng: ChainlinkRNG | null;
  randomizerRng: RandomizerRNG | null;
  blockHashRng: BlockHashRNG;
  pnk: PNK;
  klerosCoreSnapshotProxy: KlerosCoreSnapshotProxy;
};

function getCommonFactories(
  configs: CommonFactoriesConfigs,
  provider: ethers.Provider,
  chainId: number
): CommonFactories {
  return {
    disputeKitClassic: DisputeKitClassic__factory.connect(getAddress(configs.dkcConfig, chainId), provider),
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
    blockHashRng: BlockHashRNG__factory.connect(getAddress(configs.blockHashRngConfig, chainId), provider),
    pnk: PNK__factory.connect(getAddress(configs.pnkConfig, chainId), provider),
    klerosCoreSnapshotProxy: KlerosCoreSnapshotProxy__factory.connect(
      getAddress(configs.snapshotProxyConfig, chainId),
      provider
    ),
  };
}

export const getContracts = async (provider: ethers.Provider, deployment: DeploymentName) => {
  const { chainId } = deployments[deployment];
  let klerosCore: KlerosCore | KlerosCoreNeo | KlerosCoreUniversity;
  let sortition: SortitionModule | SortitionModuleNeo | SortitionModuleUniversity;
  let commonFactories: CommonFactories;

  switch (deployment) {
    case "devnet": {
      klerosCore = KlerosCore__factory.connect(getAddress(devnetCoreConfig, chainId), provider);
      sortition = SortitionModule__factory.connect(getAddress(devnetSortitionConfig, chainId), provider);
      commonFactories = getCommonFactories(
        {
          dkcConfig: devnetDkcConfig,
          drConfig: devnetDrConfig,
          dtrConfig: devnetDtrConfig,
          evidenceConfig: devnetEvidenceConfig,
          policyRegistryConfig: devnetPolicyRegistryConfig,
          batcherConfig: devnetBatcherConfig,
          chainlinkRngConfig: devnetChainlinkRngConfig,
          blockHashRngConfig: devnetBlockHashRngConfig,
          pnkConfig: devnetPnkConfig,
          snapshotProxyConfig: devnetSnapshotProxyConfig,
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
          dkcConfig: devnetDkcUniversityConfig,
          drConfig: devnetDrUniversityConfig,
          dtrConfig: devnetDtrConfig,
          evidenceConfig: devnetEvidenceConfig,
          policyRegistryConfig: devnetPolicyRegistryConfig,
          batcherConfig: devnetBatcherConfig,
          chainlinkRngConfig: devnetChainlinkRngConfig,
          blockHashRngConfig: devnetBlockHashRngConfig,
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
          dkcConfig: testnetDkcConfig,
          drConfig: testnetDrConfig,
          dtrConfig: testnetDtrConfig,
          evidenceConfig: testnetEvidenceConfig,
          policyRegistryConfig: testnetPolicyRegistryConfig,
          batcherConfig: testnetBatcherConfig,
          chainlinkRngConfig: testnetChainlinkRngConfig,
          blockHashRngConfig: testnetBlockHashRngConfig,
          pnkConfig: testnetPnkConfig,
          snapshotProxyConfig: testnetSnapshotProxyConfig,
        },
        provider,
        chainId
      );
      break;
    case "mainnetNeo":
      klerosCore = KlerosCoreNeo__factory.connect(getAddress(mainnetCoreConfig, chainId), provider);
      sortition = SortitionModuleNeo__factory.connect(getAddress(mainnetSortitionConfig, chainId), provider);
      commonFactories = getCommonFactories(
        {
          dkcConfig: mainnetDkcConfig,
          drConfig: mainnetDrConfig,
          dtrConfig: mainnetDtrConfig,
          evidenceConfig: mainnetEvidenceConfig,
          policyRegistryConfig: mainnetPolicyRegistryConfig,
          batcherConfig: mainnetBatcherConfig,
          chainlinkRngConfig: mainnetChainlinkRngConfig,
          randomizerRngConfig: mainnetRandomizerRngConfig,
          blockHashRngConfig: mainnetBlockHashRngConfig,
          pnkConfig: mainnetPnkConfig,
          snapshotProxyConfig: mainnetSnapshotProxyConfig,
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
