import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { BigNumber } from "ethers";
import getContractAddress from "../deploy-helpers/getContractAddress";
import { get } from "http";

enum HomeChains {
  ARBITRUM_ONE = 42161,
  ARBITRUM_GOERLI = 421613,
  HARDHAT = 31337,
}

const deployUpgradeKlerosCore: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts, getChainId } = hre;
  const { deploy, execute } = deployments;
  const { AddressZero } = hre.ethers.constants;
  const RNG_LOOKAHEAD = 20;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("Upgrading to %s with deployer %s", HomeChains[chainId], deployer);

  try {
    const pnk = await deployments.get("PNK");

    const dai = await deployments.get("DAI");

    const weth = await deployments.get("WETH");

    const rng = await deployments.get("RandomizerRNG");

    const disputeKit = await deployments.get("DisputeKitClassic");

    const minStake = BigNumber.from(10).pow(20).mul(2);
    const alpha = 10000;
    const feeForJuror = BigNumber.from(10).pow(17);

    // console.log("Upgrading the SortitionModule...");
    // const sortitionModuleDeployment = await deployments.get("SortitionModule")
    const sortitionModuleDeployment = await deployments.get("SortitionModule");

    console.log("Upgrading the KlerosCore...");
    const klerosCoreDeploymenent = await deploy("KlerosCore", {
      from: deployer,
      proxy: {
        proxyContract: "UUPSProxy",
        proxyArgs: ["{implementation}", "{data}"],
        checkProxyAdmin: false,
        checkABIConflict: false,
        execute: {
          init: {
            methodName: "initialize",
            args: [
              deployer,
              pnk,
              AddressZero,
              disputeKit.address,
              false,
              [minStake, alpha, feeForJuror, 256], // minStake, alpha, feeForJuror, jurorsForCourtJump
              [0, 0, 0, 10], // evidencePeriod, commitPeriod, votePeriod, appealPeriod
              ethers.utils.hexlify(5), // Extra data for sortition module will return the default value of K
              sortitionModuleDeployment.address,
            ],
          },
          // Workaround to bypass the current version of hardhat-deploy which fallback on `upgradeTo` when no updateMethod is defined
          // To be replaced by `initialize` or any new function when upgrading while initializing again the proxy storage (reinitializer(uint version) modifier)
          onUpgrade: {
            methodName: "governor",
            args: [],
          },
        },
      },
      args: [],
      log: true,
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

deployUpgradeKlerosCore.tags = ["Upgrade", "KlerosCore"];
deployUpgradeKlerosCore.skip = async ({ getChainId }) => {
  const chainId = Number(await getChainId());
  return !HomeChains[chainId];
};

export default deployUpgradeKlerosCore;
