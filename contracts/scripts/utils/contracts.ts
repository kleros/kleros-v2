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
      core = (await ethers.getContract("KlerosCoreNeo")) as KlerosCoreNeo;
      sortition = (await ethers.getContract("SortitionModuleNeo")) as SortitionModuleNeo;
      disputeKitClassic = (await ethers.getContract("DisputeKitClassicNeo")) as DisputeKitClassic;
      disputeResolver = (await ethers.getContract("DisputeResolverNeo")) as DisputeResolver;
      break;
    case Cores.BASE:
      core = (await ethers.getContract("KlerosCore")) as KlerosCore;
      sortition = (await ethers.getContract("SortitionModule")) as SortitionModule;
      disputeKitClassic = (await ethers.getContract("DisputeKitClassic")) as DisputeKitClassic;
      disputeResolver = (await ethers.getContract("DisputeResolver")) as DisputeResolver;
      break;
    case Cores.UNIVERSITY:
      core = (await ethers.getContract("KlerosCoreUniversity")) as KlerosCoreUniversity;
      sortition = (await ethers.getContract("SortitionModuleUniversity")) as SortitionModuleUniversity;
      disputeKitClassic = (await ethers.getContract("DisputeKitClassicUniversity")) as DisputeKitClassic;
      disputeResolver = (await ethers.getContract("DisputeResolverUniversity")) as DisputeResolver;
      break;
    default:
      throw new Error("Invalid core type, must be one of BASE, NEO, or UNIVERSITY");
  }
  const disputeTemplateRegistry = (await ethers.getContract("DisputeTemplateRegistry")) as DisputeTemplateRegistry;
  const policyRegistry = (await ethers.getContract("PolicyRegistry")) as PolicyRegistry;
  const batcher = (await ethers.getContract("TransactionBatcher")) as TransactionBatcher;
  const chainlinkRng = await ethers.getContractOrNull<ChainlinkRNG>("ChainlinkRNG");
  const randomizerRng = await ethers.getContractOrNull<RandomizerRNG>("RandomizerRNG");
  const blockHashRNG = await ethers.getContractOrNull<BlockHashRNG>("BlockHashRNG");
  const pnk = (await ethers.getContract("PNK")) as PNK;
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
  };
};
