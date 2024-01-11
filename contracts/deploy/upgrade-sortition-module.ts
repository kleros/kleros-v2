import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deployUpgradable } from "./utils/deployUpgradable";
import { HomeChains, isSkipped } from "./utils";

const deployUpgradeSortitionModule: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts, getChainId } = hre;
  const RNG_LOOKAHEAD = 20;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("upgrading to %s with deployer %s", HomeChains[chainId], deployer);

  try {
    const rng = await deployments.get("RandomizerRNG");
    const klerosCore = await deployments.get("KlerosCore");
    const klerosCoreAddress = klerosCore.address;

    console.log("upgrading the SortitionModule...");
    await deployUpgradable(deployments, "SortitionModule", {
      from: deployer,
      args: [
        deployer,
        klerosCoreAddress,
        1800, // minStakingTime
        1800, // maxFreezingTime
        rng.address,
        RNG_LOOKAHEAD,
      ],
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

deployUpgradeSortitionModule.tags = ["Upgrade", "SortitionModule"];
deployUpgradeSortitionModule.skip = async ({ network }) => {
  return isSkipped(network, !HomeChains[network.config.chainId ?? 0]);
};

export default deployUpgradeSortitionModule;
