import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { HomeChains, isSkipped } from "./utils";
import { getContractOrDeploy } from "./utils/getContractOrDeploy";

const deployRng: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts, getChainId } = hre;
  const { deploy } = deployments;

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

  await getContractOrDeploy(hre, "RandomizerRNG", {
    from: deployer,
    args: [deployer, deployer, randomizerOracle.target], // The consumer is configured as the SortitionModule later
    log: true,
  });
};

deployRng.tags = ["RandomizerRNG"];
deployRng.skip = async ({ network }) => {
  return isSkipped(network, !HomeChains[network.config.chainId ?? 0]);
};

export default deployRng;
