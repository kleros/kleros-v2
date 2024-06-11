import { ethers } from "ethers";
import { DeployResult, DeployOptions, DeploymentsExtension, ProxyOptions } from "hardhat-deploy/types";

// https://github.com/safe-global/safe-singleton-factory/blob/6b52fa2aeaddcb966d096e60858f64f5a9752368/README.md?plain=1#L34
export const SAFE_SINGLETON_FACTORY = "0x914d7Fec6aaC8cd542e72Bca78B30650d45643d7";

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
} & DeployOptions;

export const deployUpgradable = async (
  deployments: DeploymentsExtension,
  proxy: string,
  options: DeployUpgradableOptions
): Promise<DeployResult> => {
  const { deploy } = deployments;
  const fullOptions = formatOptions(options);
  return deploy(proxy, fullOptions);
};

export const deployUpgradableDeterministic = async (
  deployments: DeploymentsExtension,
  proxy: string,
  options: DeployUpgradableOptions
): Promise<DeployResult> => {
  const { deploy } = await upgradableDeterministic(deployments, proxy, options);
  return deploy();
};

export const upgradableDeterministic = async (
  deployments: DeploymentsExtension,
  proxy: string,
  options: DeployUpgradableOptions
): Promise<{
  address: string;
  implementationAddress?: string | undefined;
  deploy(): Promise<DeployResult>;
}> => {
  const { deterministic } = deployments;
  const fullOptions = formatOptions({ ...options, deterministicDeployment: SAFE_SINGLETON_FACTORY });
  return deterministic(proxy, { ...fullOptions, salt: ethers.utils.formatBytes32String("Just use Kleros!") });
};

const formatOptions = (options: DeployUpgradableOptions): DeployOptions => {
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
  return fullOptions;
};
