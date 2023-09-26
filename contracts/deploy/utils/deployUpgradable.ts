import { DeployResult, DeployOptions } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export function deployUpgradable(
  hre: HardhatRuntimeEnvironment,
  deployer: string,
  contract: string,
  params: any[],
  deployOptions?: Omit<DeployOptions, "from">
): Promise<DeployResult> {
  const { deploy } = hre.deployments;
  return deploy(contract, {
    from: deployer,
    proxy: {
      proxyContract: "UUPSProxy",
      proxyArgs: ["{implementation}", "{data}"],
      checkProxyAdmin: false,
      checkABIConflict: false,
      execute: {
        init: {
          methodName: "initialize",
          args: params,
        },
        onUpgrade: {
          methodName: "governor",
          args: [],
        },
      },
    },
    log: true,
    ...deployOptions,
  });
}
