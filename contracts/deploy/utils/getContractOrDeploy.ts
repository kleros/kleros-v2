import { Contract } from "@ethersproject/contracts";
import { DeployOptions } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export const getContractOrDeploy = async (
  hre: HardhatRuntimeEnvironment,
  contractName: string,
  options: DeployOptions
): Promise<Contract> => {
  let contract = await hre.ethers.getContractOrNull(contractName);
  if (!contract) {
    console.log(`contract ${contractName} not deployed, deploying now...`);
    await hre.deployments.deploy(contractName, options);
    contract = await hre.ethers.getContract(contractName);
  } else {
    console.log(`contract ${contractName} already deployed`);
  }
  return contract;
};
