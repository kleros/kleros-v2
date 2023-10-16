import { DeployResult, DeployOptions, DeploymentsExtension } from "hardhat-deploy/types";
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

export const deployUpgradableEXPERIMENTAL = async (
  deployments: DeploymentsExtension,
  contract: string,
  options: DeployOptions
): Promise<DeployResult> => {
  const { deploy } = deployments;
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

export const deployUpgradableEXPERIMENTAL2 = async (
  deployments: DeploymentsExtension,
  proxy: string,
  newImplementation: string,
  initializer = "initialize",
  options: DeployOptions
): Promise<DeployResult> => {
  const { deploy } = deployments;
  const { args, ...otherOptions } = options;
  return await deploy(proxy, {
    contract: newImplementation,
    proxy: {
      implementationName: newImplementation + "_Implementation",
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
          methodName: initializer,
          args: args ?? [],
        },
        onUpgrade: {
          methodName: initializer,
          args: args ?? [],
        },
      },
    },
    ...otherOptions,
  });
};
