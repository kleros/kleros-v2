import { DeployOptions } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { deployUpgradable } from "./deployUpgradable";
import { BaseContract } from "ethers";

export const getContractOrDeploy = async <
  C extends BaseContract = BaseContract,
>(
  hre: HardhatRuntimeEnvironment,
  contractName: string,
  options: DeployOptions,
): Promise<C> => {
  let contract = await hre.ethers.getContractOrNull<C>(contractName);
  if (!contract) {
    console.log(`contract ${contractName} not deployed, deploying now...`);
    await hre.deployments.deploy(contractName, options);
    contract = await hre.ethers.getContract<C>(contractName);
  } else {
    console.log(`contract ${contractName} already deployed`);
  }
  return contract;
};

export const getContractOrDeployUpgradable = async <
  C extends BaseContract = BaseContract,
>(
  hre: HardhatRuntimeEnvironment,
  contractName: string,
  options: DeployOptions,
): Promise<C> => {
  let contract = await hre.ethers.getContractOrNull<C>(contractName);
  if (!contract) {
    console.log(
      `contract ${contractName} not deployed, deploying as upgradable now...`,
    );
    await deployUpgradable(hre.deployments, contractName, options);
    contract = await hre.ethers.getContract<C>(contractName);
  } else {
    console.log(`contract ${contractName} already deployed`);
  }
  return contract;
};
