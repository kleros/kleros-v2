import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { HomeChains, isSkipped } from "./utils";
import { ethers } from "hardhat";
import { ChainlinkRNG, SortitionModule } from "../typechain-types";

const task: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, getChainId } = hre;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId()) as unknown as HomeChains; // Checked at runtime by skip()
  console.log("deploying to %s with deployer %s", HomeChains[chainId], deployer);

  const chainlinkRng = await ethers.getContract<ChainlinkRNG>("ChainlinkRNG");
  const sortitionModule = await ethers.getContract<SortitionModule>("SortitionModule");

  console.log(`chainlinkRng.changeConsumer(${sortitionModule.target})`);
  await chainlinkRng.changeConsumer(sortitionModule.target);

  console.log(`sortitionModule.changeRandomNumberGenerator(${chainlinkRng.target})`);
  await sortitionModule.changeRandomNumberGenerator(chainlinkRng.target);
};

task.tags = ["ChangeSortitionModuleRNG"];
task.skip = async ({ network }) => {
  return isSkipped(network, !HomeChains[network.config.chainId ?? 0]);
};

export default task;
