import { DeployOptions } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { deployUpgradable } from "./deployUpgradable";
import { Contract } from "ethers";

export const getContractOrDeploy = async (
  hre: HardhatRuntimeEnvironment,
  contractName: string,
  options: DeployOptions
): Promise<Contract> => {
  let contract = await hre.ethers.getContractOrNull<Contract>(contractName);
  if (!contract) {
    console.log(`contract ${contractName} not deployed, deploying now...`);
    await hre.deployments.deploy(contractName, options);
    contract = await hre.ethers.getContract<Contract>(contractName);
  } else {
    console.log(`contract ${contractName} already deployed`);
  }
  return contract;
};

export const getContractOrDeployUpgradable = async (
  hre: HardhatRuntimeEnvironment,
  contractName: string,
  options: DeployOptions
): Promise<Contract> => {
  let contract = await hre.ethers.getContractOrNull<Contract>(contractName);
  if (!contract) {
    console.log(`contract ${contractName} not deployed, deploying as upgradable now...`);
    await deployUpgradable(hre.deployments, contractName, options);
    contract = await hre.ethers.getContract<Contract>(contractName);
  } else {
    console.log(`contract ${contractName} already deployed`);
  }
  return contract;
};
