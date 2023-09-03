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

const deployUpgradeSortitionModule: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
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

    const klerosCore = await deployments.get("KlerosCore");
    const KlerosCoreAddress = klerosCore.address;

    console.log("Upgrading the SortitionModule...");
    const sortitionModuleDeployment = await deploy("SortitionModule", {
      from: deployer,
      proxy: {
        proxyContract: "UUPSProxy",
        proxyArgs: ["{implementation}", "{data}"],
        checkProxyAdmin: false,
        checkABIConflict: false,
        execute: {
          init: {
            methodName: "initialize",
            args: [deployer, KlerosCoreAddress, 1800, 1800, rng.address, RNG_LOOKAHEAD], // minStakingTime, maxFreezingTime
          },
          // Workaround to bypass the current version of hardhat-deploy which fallback on `upgradeTo` when no updateMethod is defined
          // To be replaced by `initialize` or any new function when upgrading while initializing again the proxy storage (reinitializer(uint version) modifier)
          onUpgrade: {
            methodName: "governor",
            args: [],
          },
        },
      },
      log: true,
      args: [],
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

deployUpgradeSortitionModule.tags = ["Upgrade", "SortitionModule"];
deployUpgradeSortitionModule.skip = async ({ getChainId }) => {
  const chainId = Number(await getChainId());
  return !HomeChains[chainId];
};

export default deployUpgradeSortitionModule;
