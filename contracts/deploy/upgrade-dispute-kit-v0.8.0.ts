import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deployUpgradable } from "./utils/deployUpgradable";
import { HomeChains, isSkipped } from "./utils";
import { getContractNamesFromNetwork } from "../scripts/utils/contracts";

const deployUpgradeDisputeKit: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts, getChainId } = hre;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("upgrading on %s with deployer %s", HomeChains[chainId], deployer);

  try {
    const { disputeKitClassic: contractName } = await getContractNamesFromNetwork(hre);
    console.log(`upgrading ${contractName}...`);
    await deployUpgradable(deployments, contractName, {
      contract: contractName,
      initializer: "initialize2",
      from: deployer,
      // Warning: do not reinitialize everything, only the new variables
      args: [],
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

deployUpgradeDisputeKit.tags = ["Upgrade", "DisputeKit"];
deployUpgradeDisputeKit.skip = async ({ network }) => {
  return isSkipped(network, !HomeChains[network.config.chainId ?? 0]);
};

export default deployUpgradeDisputeKit;
