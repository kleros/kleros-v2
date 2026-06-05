import {
  DeployResult,
  DeployOptions,
  DeploymentsExtension,
  DeployOptionsBase,
  ProxyOptions,
} from "hardhat-deploy/types";

// Rationale: https://github.com/kleros/kleros-v2/pull/1214#issue-1879116629
function proxyOptions(proxyContract: string): ProxyOptions {
  return {
    proxyContract,
    proxyArgs: ["{implementation}", "{data}"],
    checkProxyAdmin: false, // Not relevant for UUPSProxy
    checkABIConflict: false, // Not relevant for UUPSProxy
    upgradeFunction: {
      methodName: "upgradeToAndCall",
      upgradeArgs: ["{implementation}", "{data}"],
    },
  };
}

export type DeployUpgradableOptions = {
  newImplementation?: string;
  initializer?: string;
  proxyAlias?: string;
} & DeployOptionsBase;

/**
 * Deploy a contract with an upgradable proxy
 * NOTE: This function assumes the existence of a proxy contract with the name `${proxy}Proxy`, if there is none add the option `proxyAlias: "UUPSProxy"`
 * @param deployments - The deployments extension
 * @param proxy - The name of the proxy contract
 * @param options - The options for the deployment
 * @returns The deployment result
 */
export const deployUpgradable = async (
  deployments: DeploymentsExtension,
  proxy: string,
  options: DeployUpgradableOptions
): Promise<DeployResult> => {
  const { deploy } = deployments;
  const {
    newImplementation,
    initializer,
    args: initializerArgs,
    proxy: proxyOverrides,
    proxyAlias,
    ...otherOptions
  } = options;

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
      ...proxyOptions(proxyAlias ?? `${proxy}Proxy`),
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
