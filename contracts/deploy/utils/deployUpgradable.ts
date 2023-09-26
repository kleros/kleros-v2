import { DeployResult, DeployOptions } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export function deployUpgradable(
  hre: HardhatRuntimeEnvironment,
  contract: string,
  options: DeployOptions
): Promise<DeployResult> {
  const { deploy } = hre.deployments;
  const { args, ...otherOptions } = options;
  return deploy(contract, {
    proxy: {
      proxyContract: "UUPSProxy",
      proxyArgs: ["{implementation}", "{data}"],
      checkProxyAdmin: false,
      checkABIConflict: false,
      execute: {
        init: {
          methodName: "initialize",
          args: args ?? [],
        },
        onUpgrade: {
          methodName: "governor",
          args: [],
        },
      },
    },
    ...otherOptions,
  });
}
