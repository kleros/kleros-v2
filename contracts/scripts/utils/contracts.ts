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
} from "../../typechain-types";

export const Cores = {
  BASE: "BASE",
  NEO: "NEO",
  UNIVERSITY: "UNIVERSITY",
} as const;

export type Core = (typeof Cores)[keyof typeof Cores];

export const getContracts = async (hre: HardhatRuntimeEnvironment, coreType: Core) => {
  const { ethers } = hre;
  let core: KlerosCore | KlerosCoreNeo | KlerosCoreUniversity;
  let sortition: SortitionModule | SortitionModuleNeo | SortitionModuleUniversity;
  let disputeKitClassic: DisputeKitClassic;
  let disputeResolver: DisputeResolver;
  switch (coreType) {
    case Cores.NEO:
      core = await ethers.getContract<KlerosCoreNeo>("KlerosCoreNeo");
      sortition = await ethers.getContract<SortitionModuleNeo>("SortitionModuleNeo");
      disputeKitClassic = await ethers.getContract<DisputeKitClassic>("DisputeKitClassicNeo");
      disputeResolver = await ethers.getContract<DisputeResolver>("DisputeResolverNeo");
      break;
    case Cores.BASE:
      core = await ethers.getContract<KlerosCore>("KlerosCore");
      sortition = await ethers.getContract<SortitionModule>("SortitionModule");
      disputeKitClassic = await ethers.getContract<DisputeKitClassic>("DisputeKitClassic");
      disputeResolver = await ethers.getContract<DisputeResolver>("DisputeResolver");
      break;
    case Cores.UNIVERSITY:
      core = await ethers.getContract<KlerosCoreUniversity>("KlerosCoreUniversity");
      sortition = await ethers.getContract<SortitionModuleUniversity>("SortitionModuleUniversity");
      disputeKitClassic = await ethers.getContract<DisputeKitClassic>("DisputeKitClassicUniversity");
      disputeResolver = await ethers.getContract<DisputeResolver>("DisputeResolverUniversity");
      break;
    default:
      throw new Error("Invalid core type, must be one of BASE, NEO, or UNIVERSITY");
  }
  const disputeTemplateRegistry = await ethers.getContract<DisputeTemplateRegistry>("DisputeTemplateRegistry");
  const policyRegistry = await ethers.getContract<PolicyRegistry>("PolicyRegistry");
  const batcher = await ethers.getContract<TransactionBatcher>("TransactionBatcher");
  const chainlinkRng = await ethers.getContractOrNull<ChainlinkRNG>("ChainlinkRNG");
  const randomizerRng = await ethers.getContractOrNull<RandomizerRNG>("RandomizerRNG");
  const blockHashRNG = await ethers.getContractOrNull<BlockHashRNG>("BlockHashRNG");
  const pnk = await ethers.getContract<PNK>("PNK");
  const snapshotProxy = await ethers.getContractOrNull<KlerosCoreSnapshotProxy>("KlerosCoreSnapshotProxy");
  return {
    core,
    sortition,
    disputeKitClassic,
    disputeResolver,
    disputeTemplateRegistry,
    policyRegistry,
    chainlinkRng,
    randomizerRng,
    blockHashRNG,
    pnk,
    batcher,
    snapshotProxy,
  };
};
