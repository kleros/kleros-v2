import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  BlockHashRNG,
  ChainlinkRNG,
  DisputeKitClassic,
  DisputeResolver,
  DisputeTemplateRegistry,
  KlerosCore,
  KlerosCoreNeo,
  PNK,
  RandomizerRNG,
  SortitionModule,
  SortitionModuleNeo,
  TransactionBatcher,
} from "../../typechain-types";

export enum Cores {
  BASE,
  NEO,
  UNIVERSITY,
}

export const getContracts = async (hre: HardhatRuntimeEnvironment, coreType: Cores) => {
  const { ethers } = hre;
  let core: KlerosCore | KlerosCoreNeo;
  let sortition: SortitionModule | SortitionModuleNeo;
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
      throw new Error("University core is not supported");
    default:
      throw new Error("Invalid core type, must be one of base, neo");
  }
  const disputeTemplateRegistry = (await ethers.getContract("DisputeTemplateRegistry")) as DisputeTemplateRegistry;
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
    chainlinkRng,
    randomizerRng,
    blockHashRNG,
    pnk,
    batcher,
  };
};
