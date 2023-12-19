import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { BigNumber } from "ethers";
import { deployUpgradable } from "./utils/deployUpgradable";
import { HomeChains, isSkipped } from "./utils";

const deployUpgradeKlerosCore: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts, getChainId } = hre;
  const { AddressZero } = hre.ethers.constants;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("upgrading to %s with deployer %s", HomeChains[chainId], deployer);

  try {
    const pnk = await deployments.get("PNK");
    const disputeKit = await deployments.get("DisputeKitClassic");
    const minStake = BigNumber.from(10).pow(20).mul(2);
    const alpha = 10000;
    const feeForJuror = BigNumber.from(10).pow(17);
    const sortitionModule = await deployments.get("SortitionModule");

    console.log("upgrading the KlerosCore...");
    await deployUpgradable(deployments, "KlerosCore", {
      from: deployer,
      args: [
        deployer,
        pnk,
        AddressZero,
        disputeKit.address,
        false,
        [minStake, alpha, feeForJuror, 256], // minStake, alpha, feeForJuror, jurorsForCourtJump
        [0, 0, 0, 10], // evidencePeriod, commitPeriod, votePeriod, appealPeriod
        ethers.utils.hexlify(5), // Extra data for sortition module will return the default value of K
        sortitionModule.address,
      ],
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

deployUpgradeKlerosCore.tags = ["Upgrade", "KlerosCore"];
deployUpgradeKlerosCore.skip = async ({ network }) => {
  return isSkipped(network, !HomeChains[network.config.chainId ?? 0]);
};

export default deployUpgradeKlerosCore;
