import {
  DeployResult,
  DeployOptions,
  DeploymentsExtension,
  DeployOptionsBase,
  ProxyOptions,
} from "hardhat-deploy/types";

// Rationale: https://github.com/kleros/kleros-v2/pull/1214#issue-1879116629
const PROXY_OPTIONS: ProxyOptions = {
  proxyContract: "UUPSProxy",
  proxyArgs: ["{implementation}", "{data}"],
  checkProxyAdmin: false, // Not relevant for UUPSProxy
  checkABIConflict: false, // Not relevant for UUPSProxy
  upgradeFunction: {
    methodName: "upgradeToAndCall",
    upgradeArgs: ["{implementation}", "{data}"],
  },
};

type DeployUpgradableOptions = {
  newImplementation?: string;
  initializer?: string;
} & DeployOptionsBase;

export const deployUpgradable = async (
  deployments: DeploymentsExtension,
  proxy: string,
  options: DeployUpgradableOptions
): Promise<DeployResult> => {
  const { deploy } = deployments;
  const { newImplementation, initializer, args: initializerArgs, proxy: proxyOverrides, ...otherOptions } = options;

  const methodName = initializer ?? "initialize";
  const args = initializerArgs ?? [];

  const contract: Partial<DeployOptions> = newImplementation
    ? {
        contract: newImplementation,
      }
    : {};

  const implementationName: Partial<ProxyOptions> = newImplementation
    ? {
        implementationName: newImplementation + "_Implementation",
      }
    : {};

  const fullOptions: DeployOptions = {
    ...otherOptions,
    ...contract,
    proxy: {
      ...PROXY_OPTIONS,
      ...implementationName,
      ...((proxyOverrides as ProxyOptions) ?? {}),
      execute: {
        init: {
          methodName,
          args,
        },
        onUpgrade: {
          methodName,
          args,
        },
      },
    },
  };

  // console.debug("fullOptions: ", JSON.stringify(fullOptions));
  return deploy(proxy, fullOptions);
};
