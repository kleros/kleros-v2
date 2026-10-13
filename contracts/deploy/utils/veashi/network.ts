import { existsSync, readFileSync } from "fs";
import path from "path";
import { AbiCoder, JsonRpcProvider, Provider } from "ethers";
import { HardhatRuntimeEnvironment, HttpNetworkConfig, Network } from "hardhat/types";
import { isSkipped } from "..";
import names from "./deploymentNames.json";
import { MAINNET_CHAINS, mainnetParameters, standInParameters, VeashiParameters } from "./parameters";

/** hardhat-deploy names shared by the scripts, the bot's deploy-output fixture and its config generator. */
export const DEPLOYMENT_NAMES: Readonly<typeof names> = names;

export const VEASHI_TAGS = {
  foreign: "VeashiForeign",
  home: "VeashiHome",
  foreignConfigure: "VeashiForeignConfigure",
} as const;

/**
 * hardhat-deploy network names of the two chains (hardhat.config.ts), i.e. the folders the operator's deploy writes
 * under `contracts/deployments`. No companion network links them: hardhat-deploy's `--reset` also deletes a companion's
 * deployment folder, so a companion would let `deploy --network base --reset` wipe `deployments/arbitrum`.
 */
export const VEASHI_NETWORKS = { foreign: "base", home: "arbitrum" } as const;

export type Side = "foreign" | "home";

/** The in-process hardhat network, where the stand-in parameter set applies. */
export function isInProcessHardhat(network: Pick<Network, "name" | "live">): boolean {
  return network.name === "hardhat" && !network.live;
}

/** Whether a Veashi script for `side` may run on `network`: Base (foreign) or Arbitrum (home), or in-process hardhat. */
export function isVeashiChain(network: Pick<Network, "name" | "live" | "config">, side: Side): boolean {
  if (isInProcessHardhat(network)) return true;
  return network.config.chainId === MAINNET_CHAINS[side];
}

export async function skipUnlessVeashiChain(network: Network, side: Side, script: string): Promise<boolean> {
  const ok = isVeashiChain(network, side);
  if (!ok) {
    const wanted = side === "foreign" ? "Base (8453)" : "Arbitrum One (42161)";
    console.error(
      `Veashi: ${script} deploys on ${wanted} or the in-process hardhat network only; ` +
        `skipped on ${network.name} (chain ${network.config.chainId ?? "unknown"})`
    );
  }
  return isSkipped(network, !ok);
}

/**
 * The validated parameter set for this network, before any transaction: the stand-in on the in-process hardhat
 * network, the mainnet set (SDK addresses, `VEASHI_KEEPER_ADDRESS` required) everywhere else.
 */
export function veashiParameters(hre: Pick<HardhatRuntimeEnvironment, "network">, side: Side): VeashiParameters {
  if (!isVeashiChain(hre.network, side)) {
    throw new Error(`Veashi: network ${hre.network.name} is not the ${side} chain`);
  }
  return isInProcessHardhat(hre.network) ? standInParameters() : mainnetParameters();
}

export async function deployerAddress(hre: HardhatRuntimeEnvironment): Promise<string> {
  return (await hre.getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
}

const otherSide = (side: Side): Side => (side === "foreign" ? "home" : "foreign");

/**
 * A deployment of the other chain: from the same deployments on in-process hardhat, otherwise from the other network's
 * deploy output (`deployments/<base|arbitrum>/<name>.json`), whose recorded chain id must be that chain's.
 */
export async function counterpartDeployment(
  hre: HardhatRuntimeEnvironment,
  side: Side,
  name: string
): Promise<{ address: string }> {
  if (isInProcessHardhat(hre.network)) {
    const deployment = await hre.deployments.getOrNull(name);
    if (!deployment) throw new Error(`Veashi: ${name} is not deployed; run its deploy script first`);
    return deployment;
  }
  const other = otherSide(side);
  const folder = path.join(hre.config.paths.deployments, VEASHI_NETWORKS[other]);
  const file = path.join(folder, `${name}.json`);
  if (!existsSync(file))
    throw new Error(`Veashi: ${file} does not exist; deploy ${name} on ${VEASHI_NETWORKS[other]} first`);
  const chainIdFile = path.join(folder, ".chainId");
  if (existsSync(chainIdFile) && readFileSync(chainIdFile, "utf8").trim() !== String(MAINNET_CHAINS[other])) {
    throw new Error(`Veashi: ${chainIdFile} does not record chain ${MAINNET_CHAINS[other]}`);
  }
  return { address: JSON.parse(readFileSync(file, "utf8")).address };
}

/** A read-only provider of the other chain (its network's RPC from hardhat.config.ts); this one on in-process hardhat. */
export async function counterpartProvider(hre: HardhatRuntimeEnvironment, side: Side): Promise<Provider> {
  if (isInProcessHardhat(hre.network)) return hre.ethers.provider;
  const other = otherSide(side);
  const provider = new JsonRpcProvider((hre.config.networks[VEASHI_NETWORKS[other]] as HttpNetworkConfig).url);
  const chainId = (await provider.getNetwork()).chainId;
  if (chainId !== BigInt(MAINNET_CHAINS[other])) {
    throw new Error(
      `Veashi: the ${VEASHI_NETWORKS[other]} RPC answers chain ${chainId}, expected ${MAINNET_CHAINS[other]}`
    );
  }
  return provider;
}

/** The Lightbulb's `arbitratorExtraData`: court ID and minimum jurors, as KlerosCore and the gateways decode it. */
export function lightbulbExtraData(p: VeashiParameters): string {
  return AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [p.court.id, p.court.minJurors]);
}
