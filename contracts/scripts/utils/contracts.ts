import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  BlockHashRNG,
  ChainlinkRNG,
  DisputeKitClassic,
  DisputeResolver,
  DisputeTemplateRegistry,
  KlerosCore,
  KlerosCoreNeo,
  KlerosCoreUniversity,
  PNK,
  PolicyRegistry,
  RandomizerRNG,
  SortitionModule,
  SortitionModuleNeo,
  SortitionModuleUniversity,
  TransactionBatcher,
  KlerosCoreSnapshotProxy,
  EvidenceModule,
} from "../../typechain-types";

export const Cores = {
  BASE: "BASE",
  NEO: "NEO",
  UNIVERSITY: "UNIVERSITY",
} as const;

export type Core = (typeof Cores)[keyof typeof Cores];

/**
 * Get contract names by specifying the coreType (BASE, NEO, UNIVERSITY).
 * @param coreType - Core type
 * @returns Contract names
 */
export const getContractNames = (coreType: Core) => {
  const coreSpecificNames = {
    [Cores.NEO]: {
      core: "KlerosCoreNeo",
      sortition: "SortitionModuleNeo",
      disputeKitClassic: "DisputeKitClassicNeo",
      disputeResolver: "DisputeResolverNeo",
    },
    [Cores.BASE]: {
      core: "KlerosCore",
      sortition: "SortitionModule",
      disputeKitClassic: "DisputeKitClassic",
      disputeResolver: "DisputeResolver",
    },
    [Cores.UNIVERSITY]: {
      core: "KlerosCoreUniversity",
      sortition: "SortitionModuleUniversity",
      disputeKitClassic: "DisputeKitClassicUniversity",
      disputeResolver: "DisputeResolverUniversity",
    },
  };

  if (!(coreType in coreSpecificNames)) throw new Error("Invalid core type, must be one of BASE, NEO, or UNIVERSITY");

  return {
    ...coreSpecificNames[coreType],
    evidence: "EvidenceModule",
    disputeTemplateRegistry: "DisputeTemplateRegistry",
    policyRegistry: "PolicyRegistry",
    batcher: "TransactionBatcher",
    chainlinkRng: "ChainlinkRNG",
    randomizerRng: "RandomizerRNG",
    blockHashRNG: "BlockHashRNG",
    pnk: "PNK",
    snapshotProxy: "KlerosCoreSnapshotProxy",
  };
};

/**
 * Get contracts by specifying the coreType (BASE, NEO, UNIVERSITY).
 * @param hre - Hardhat runtime environment
 * @param coreType - Core type
 * @returns Contracts
 */
export const getContracts = async (hre: HardhatRuntimeEnvironment, coreType: Core) => {
  const { ethers } = hre;
  let core: KlerosCore | KlerosCoreNeo | KlerosCoreUniversity;
  let sortition: SortitionModule | SortitionModuleNeo | SortitionModuleUniversity;
  switch (coreType) {
    case Cores.NEO:
      core = await ethers.getContract<KlerosCoreNeo>(getContractNames(coreType).core);
      sortition = await ethers.getContract<SortitionModuleNeo>(getContractNames(coreType).sortition);
      break;
    case Cores.BASE:
      core = await ethers.getContract<KlerosCore>(getContractNames(coreType).core);
      sortition = await ethers.getContract<SortitionModule>(getContractNames(coreType).sortition);
      break;
    case Cores.UNIVERSITY:
      core = await ethers.getContract<KlerosCoreUniversity>(getContractNames(coreType).core);
      sortition = await ethers.getContract<SortitionModuleUniversity>(getContractNames(coreType).sortition);
      break;
    default:
      throw new Error("Invalid core type, must be one of BASE, NEO, or UNIVERSITY");
  }
  const disputeKitClassic = await ethers.getContract<DisputeKitClassic>(getContractNames(coreType).disputeKitClassic);
  const disputeResolver = await ethers.getContract<DisputeResolver>(getContractNames(coreType).disputeResolver);
  const disputeTemplateRegistry = await ethers.getContract<DisputeTemplateRegistry>(
    getContractNames(coreType).disputeTemplateRegistry
  );
  const evidence = await ethers.getContract<EvidenceModule>(getContractNames(coreType).evidence);
  const policyRegistry = await ethers.getContract<PolicyRegistry>(getContractNames(coreType).policyRegistry);
  const batcher = await ethers.getContract<TransactionBatcher>(getContractNames(coreType).batcher);
  const chainlinkRng = await ethers.getContractOrNull<ChainlinkRNG>(getContractNames(coreType).chainlinkRng);
  const randomizerRng = await ethers.getContractOrNull<RandomizerRNG>(getContractNames(coreType).randomizerRng);
  const blockHashRNG = await ethers.getContractOrNull<BlockHashRNG>(getContractNames(coreType).blockHashRNG);
  const pnk = await ethers.getContract<PNK>(getContractNames(coreType).pnk);
  const snapshotProxy = await ethers.getContractOrNull<KlerosCoreSnapshotProxy>(
    getContractNames(coreType).snapshotProxy
  );
  return {
    core,
    sortition,
    disputeKitClassic,
    disputeResolver,
    disputeTemplateRegistry,
    evidence,
    policyRegistry,
    chainlinkRng,
    randomizerRng,
    blockHashRNG,
    pnk,
    batcher,
    snapshotProxy,
  };
};

/**
 * Get contracts by inferring the coreType (BASE, NEO, UNIVERSITY) from the network, most convenient for most cases.
 * @param hre - Hardhat runtime environment
 * @returns Contracts
 */
export const getContractsFromNetwork = async (hre: HardhatRuntimeEnvironment) => {
  const { network } = hre;
  if (network.name === "arbitrumSepoliaDevnet" || network.name === "arbitrumSepolia") {
    return getContracts(hre, Cores.BASE);
  } else if (network.name === "arbitrum") {
    return getContracts(hre, Cores.NEO);
  } else {
    throw new Error("Invalid network");
  }
};

/**
 * Get contract names by inferring the coreType (BASE, NEO, UNIVERSITY) from the network, most convenient for most cases.
 * @param hre - Hardhat runtime environment
 * @returns Contract names
 */
export const getContractNamesFromNetwork = async (hre: HardhatRuntimeEnvironment) => {
  const { network } = hre;
  if (network.name === "arbitrumSepoliaDevnet" || network.name === "arbitrumSepolia") {
    return getContractNames(Cores.BASE);
  } else if (network.name === "arbitrum") {
    return getContractNames(Cores.NEO);
  } else {
    throw new Error("Invalid network");
  }
};
