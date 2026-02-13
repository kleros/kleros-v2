import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { HomeChains, isSkipped } from "./utils";
import { getContractOrDeploy } from "./utils/getContractOrDeploy";
import { RNGWithFallback } from "../typechain-types";

const deployRng: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, getChainId, ethers } = hre;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId()) as unknown as HomeChains; // Checked at runtime by skip()
  console.log("deploying to %s with deployer %s", HomeChains[chainId], deployer);

  // Randomizer.ai: https://randomizer.ai/docs#addresses
  const randomizerOracle = await getContractOrDeploy(hre, "RandomizerOracle", {
    from: deployer,
    contract: "RandomizerMock", // The mock is deployed only on the Hardhat network
    args: [],
    log: true,
  });

  const rng = await getContractOrDeploy(hre, "RandomizerRNG", {
    from: deployer,
    args: [
      deployer,
      deployer, // The consumer is configured as the RNGWithFallback later
      randomizerOracle.target,
    ],
    log: true,
  });

  const fallbackTimeoutSeconds = 30 * 60; // 30 minutes
  await getContractOrDeploy(hre, "RNGWithFallback", {
    from: deployer,
    args: [
      deployer,
      deployer, // The consumer is configured as the SortitionModule later
      fallbackTimeoutSeconds,
      rng.target,
    ],
    log: true,
  });

  // rng.changeConsumer() only if necessary
  const rngWithFallback = await ethers.getContract<RNGWithFallback>("RNGWithFallback");
  const rngConsumer = await rng.consumer();
  if (rngConsumer !== rngWithFallback.target) {
    console.log(`rng.changeConsumer(${rngWithFallback.target})`);
    await rng.changeConsumer(rngWithFallback.target);
  }
};

deployRng.tags = ["RandomizerRNG"];
deployRng.skip = async ({ network }) => {
  return isSkipped(network, !HomeChains[network.config.chainId ?? 0]);
};

export default deployRng;
