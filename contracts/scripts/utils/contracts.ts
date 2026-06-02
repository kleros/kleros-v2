import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  ChainlinkRNG,
  DisputeKitClassic,
  DisputeKitClassicUniversity,
  DisputeKitShutter,
  DisputeKitGated,
  DisputeKitGatedShutter,
  DisputeKitGatedArgentinaConsumerProtection,
  DisputeResolver,
  DisputeTemplateRegistry,
  KlerosCore,
  LeaderboardOffset,
  PNK,
  PolicyRegistry,
  RandomizerRNG,
  RNGWithFallback,
  SortitionModule,
  TransactionBatcher,
  KlerosCoreSnapshotProxy,
  EvidenceModule,
} from "../../typechain-types";

/**
 * Get contract names
 * @returns Contract names
 */
export const getContractNames = () => {
  return {
    core: "KlerosCore",
    sortition: "SortitionModule",
    disputeKitClassic: "DisputeKitClassic",
    disputeKitClassicUniversity: "DisputeKitClassicUniversity",
    disputeKitShutter: "DisputeKitShutter",
    disputeKitGated: "DisputeKitGated",
    disputeKitGatedShutter: "DisputeKitGatedShutter",
    disputeKitGatedArgentinaConsumerProtection:
      "DisputeKitGatedArgentinaConsumerProtection",
    disputeTemplateRegistry: "DisputeTemplateRegistry",
    disputeResolver: "DisputeResolver",
    evidence: "EvidenceModule",
    policyRegistry: "PolicyRegistry",
    batcher: "TransactionBatcher",
    chainlinkRng: "ChainlinkRNG",
    rngWithFallback: "RNGWithFallback",
    randomizerRng: "RandomizerRNG",
    pnk: "PNK",
    snapshotProxy: "KlerosCoreSnapshotProxy",
    leaderboardOffset: "LeaderboardOffset",
  };
};

/**
 * Get typechain contracts.
 * @param hre - Hardhat runtime environment
 * @returns Contracts
 */
export const getContracts = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers } = hre;

  const core = await ethers.getContract<KlerosCore>(getContractNames().core);
  const sortition = await ethers.getContract<SortitionModule>(
    getContractNames().sortition,
  );
  const disputeKitClassic = await ethers.getContract<DisputeKitClassic>(
    getContractNames().disputeKitClassic,
  );
  const disputeKitClassicUniversity =
    await ethers.getContract<DisputeKitClassicUniversity>(
      getContractNames().disputeKitClassicUniversity,
    );
  const disputeKitShutter = await ethers.getContractOrNull<DisputeKitShutter>(
    getContractNames().disputeKitShutter,
  );
  const disputeKitGated = await ethers.getContractOrNull<DisputeKitGated>(
    getContractNames().disputeKitGated,
  );
  const disputeKitGatedShutter =
    await ethers.getContractOrNull<DisputeKitGatedShutter>(
      getContractNames().disputeKitGatedShutter,
    );
  const disputeKitGatedArgentinaConsumerProtection =
    await ethers.getContractOrNull<DisputeKitGatedArgentinaConsumerProtection>(
      getContractNames().disputeKitGatedArgentinaConsumerProtection,
    );
  const disputeResolver = await ethers.getContract<DisputeResolver>(
    getContractNames().disputeResolver,
  );
  const disputeTemplateRegistry =
    await ethers.getContract<DisputeTemplateRegistry>(
      getContractNames().disputeTemplateRegistry,
    );
  const evidence = await ethers.getContract<EvidenceModule>(
    getContractNames().evidence,
  );
  const policyRegistry = await ethers.getContract<PolicyRegistry>(
    getContractNames().policyRegistry,
  );
  const batcher = await ethers.getContract<TransactionBatcher>(
    getContractNames().batcher,
  );
  const chainlinkRng = await ethers.getContractOrNull<ChainlinkRNG>(
    getContractNames().chainlinkRng,
  );
  const rngWithFallback = await ethers.getContractOrNull<RNGWithFallback>(
    getContractNames().rngWithFallback,
  );
  const randomizerRng = await ethers.getContractOrNull<RandomizerRNG>(
    getContractNames().randomizerRng,
  );
  const pnk = await ethers.getContract<PNK>(getContractNames().pnk);
  const snapshotProxy = await ethers.getContractOrNull<KlerosCoreSnapshotProxy>(
    getContractNames().snapshotProxy,
  );
  const leaderboardOffset = await ethers.getContractOrNull<LeaderboardOffset>(
    getContractNames().leaderboardOffset,
  );
  return {
    core,
    sortition,
    disputeKitClassic,
    disputeKitClassicUniversity,
    disputeKitShutter,
    disputeKitGated,
    disputeKitGatedShutter,
    disputeKitGatedArgentinaConsumerProtection,
    disputeResolver,
    disputeTemplateRegistry,
    evidence,
    policyRegistry,
    chainlinkRng,
    rngWithFallback,
    randomizerRng,
    pnk,
    batcher,
    snapshotProxy,
    leaderboardOffset,
  };
};

/**
 * Get contracts from the network, most convenient for most cases.
 * @param hre - Hardhat runtime environment
 * @returns Contracts
 */
export const getContractsFromNetwork = async (
  hre: HardhatRuntimeEnvironment,
) => {
  const { network } = hre;
  if (
    ["arbitrumSepoliaDevnet", "arbitrumSepolia", "arbitrum"].includes(
      network.name,
    )
  ) {
    return getContracts(hre);
  } else {
    throw new Error("Invalid network");
  }
};

/**
 * Get contract names from the network, most convenient for most cases.
 * @param hre - Hardhat runtime environment
 * @returns Contract names
 */
export const getContractNamesFromNetwork = async (
  hre: HardhatRuntimeEnvironment,
) => {
  const { network } = hre;
  if (
    ["arbitrumSepoliaDevnet", "arbitrumSepolia", "arbitrum"].includes(
      network.name,
    )
  ) {
    return getContractNames();
  } else {
    throw new Error("Invalid network");
  }
};
