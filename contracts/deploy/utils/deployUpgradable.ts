import {
  DeployResult,
  DeployOptions,
  DeploymentsExtension,
  DeployOptionsBase,
  ProxyOptions,
} from "hardhat-deploy/types";

// Rationale: https://github.com/kleros/kleros-v2/pull/1214#issue-1879116629 DEPRECATED
function proxyOptions(owner: string): ProxyOptions {
  return {
    proxyContract: "OpenZeppelinTransparentProxy",
    owner,
  };
}

export type DeployUpgradableOptions = {
  newImplementation?: string;
  initializer?: string | false;
} & DeployOptionsBase;

/**
 * Deploy a contract with an upgradable proxy
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
      ...proxyOptions(otherOptions.from!),
      ...implementationName,
      ...((proxyOverrides as ProxyOptions) ?? {}),
      ...(initializer !== false && {
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
      }),
    },
  };

  // console.debug("fullOptions: ", JSON.stringify(fullOptions));
  return deploy(proxy, fullOptions);
};
