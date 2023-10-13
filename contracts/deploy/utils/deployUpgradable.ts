import { DeployResult, DeployOptions } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export const deployUpgradable = async (
  hre: HardhatRuntimeEnvironment,
  contract: string,
  options: DeployOptions
): Promise<DeployResult> => {
  const { deploy } = hre.deployments;
  const { args, ...otherOptions } = options;
  // Rationale: https://github.com/kleros/kleros-v2/pull/1214#issue-1879116629
  return deploy(contract, {
    proxy: {
      proxyContract: "UUPSProxy",
      proxyArgs: ["{implementation}", "{data}"],
      checkProxyAdmin: false, // Not relevant for UUPSProxy
      checkABIConflict: false, // Not relevant for UUPSProxy
      upgradeFunction: {
        methodName: "upgradeToAndCall",
        upgradeArgs: ["{implementation}", "{data}"],
      },
      execute: {
        init: {
          methodName: "initialize",
          args: args ?? [],
        },
        onUpgrade: {
          methodName: "initialize",
          args: args ?? [],
        },
      },
    },
    ...otherOptions,
  });
};
