import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  BlockHashRNG,
  ChainlinkRNG,
  DisputeKitClassic,
  DisputeKitShutter,
  DisputeResolver,
  DisputeTemplateRegistry,
  KlerosCore,
  KlerosCoreUniversity,
  PNK,
  PolicyRegistry,
  RandomizerRNG,
  SortitionModule,
  SortitionModuleUniversity,
  TransactionBatcher,
  KlerosCoreSnapshotProxy,
  EvidenceModule,
  DisputeKitGated,
  DisputeKitGatedShutter,
} from "../../typechain-types";

export const Cores = {
  BASE: "BASE",
  UNIVERSITY: "UNIVERSITY",
} as const;

export type Core = (typeof Cores)[keyof typeof Cores];

/**
 * Get contract names by specifying the coreType (BASE, UNIVERSITY).
 * @param coreType - Core type
 * @returns Contract names
 */
export const getContractNames = (coreType: Core) => {
  const coreSpecificNames = {
    [Cores.BASE]: {
      core: "KlerosCore",
      sortition: "SortitionModule",
      disputeKitClassic: "DisputeKitClassic",
      disputeKitShutter: "DisputeKitShutter",
      disputeKitGated: "DisputeKitGated",
      disputeKitGatedShutter: "DisputeKitGatedShutter",
      disputeTemplateRegistry: "DisputeTemplateRegistry",
      disputeResolver: "DisputeResolver",
    },
    [Cores.UNIVERSITY]: {
      core: "KlerosCoreUniversity",
      sortition: "SortitionModuleUniversity",
      disputeKitClassic: "DisputeKitClassicUniversity",
      disputeKitShutter: "DisputeKitShutterUniversity",
      disputeKitGated: "DisputeKitGatedUniversity",
      disputeKitGatedShutter: "DisputeKitGatedShutterUniversity",
      disputeTemplateRegistry: "DisputeTemplateRegistryUniversity",
      disputeResolver: "DisputeResolverUniversity",
    },
  };

  if (!(coreType in coreSpecificNames)) throw new Error("Invalid core type, must be one of BASE, or UNIVERSITY");

  return {
    ...coreSpecificNames[coreType],
    evidence: "EvidenceModule",
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
 * Get contracts by specifying the coreType (BASE, UNIVERSITY).
 * @param hre - Hardhat runtime environment
 * @param coreType - Core type
 * @returns Contracts
 */
export const getContracts = async (hre: HardhatRuntimeEnvironment, coreType: Core) => {
  const { ethers } = hre;
  let core: KlerosCore | KlerosCoreUniversity;
  let sortition: SortitionModule | SortitionModuleUniversity;
  switch (coreType) {
    case Cores.BASE:
      core = await ethers.getContract<KlerosCore>(getContractNames(coreType).core);
      sortition = await ethers.getContract<SortitionModule>(getContractNames(coreType).sortition);
      break;
    case Cores.UNIVERSITY:
      core = await ethers.getContract<KlerosCoreUniversity>(getContractNames(coreType).core);
      sortition = await ethers.getContract<SortitionModuleUniversity>(getContractNames(coreType).sortition);
      break;
    default:
      throw new Error("Invalid core type, must be one of BASE, or UNIVERSITY");
  }
  const disputeKitClassic = await ethers.getContract<DisputeKitClassic>(getContractNames(coreType).disputeKitClassic);
  const disputeKitShutter = await ethers.getContractOrNull<DisputeKitShutter>(
    getContractNames(coreType).disputeKitShutter
  );
  const disputeKitGated = await ethers.getContractOrNull<DisputeKitGated>(getContractNames(coreType).disputeKitGated);
  const disputeKitGatedShutter = await ethers.getContractOrNull<DisputeKitGatedShutter>(
    getContractNames(coreType).disputeKitGatedShutter
  );
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
    disputeKitShutter,
    disputeKitGated,
    disputeKitGatedShutter,
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
 * Get contracts by inferring the coreType (BASE, UNIVERSITY) from the network, most convenient for most cases.
 * @param hre - Hardhat runtime environment
 * @returns Contracts
 */
export const getContractsFromNetwork = async (hre: HardhatRuntimeEnvironment) => {
  const { network } = hre;
  if (["arbitrumSepoliaDevnet", "arbitrumSepolia", "arbitrum"].includes(network.name)) {
    return getContracts(hre, Cores.BASE);
  } else {
    throw new Error("Invalid network");
  }
};

/**
 * Get contract names by inferring the coreType (BASE, UNIVERSITY) from the network, most convenient for most cases.
 * @param hre - Hardhat runtime environment
 * @returns Contract names
 */
export const getContractNamesFromNetwork = async (hre: HardhatRuntimeEnvironment) => {
  const { network } = hre;
  if (["arbitrumSepoliaDevnet", "arbitrumSepolia", "arbitrum"].includes(network.name)) {
    return getContractNames(Cores.BASE);
  } else {
    throw new Error("Invalid network");
  }
};
