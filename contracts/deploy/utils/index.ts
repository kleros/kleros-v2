import { Network } from "hardhat/types";

// TODO: derive this from hardhat.config and make it rely on viem/chains

export enum HardhatChain {
  HARDHAT = 31337,
}

export enum HomeChains {
  ARBITRUM_ONE = 42161,
  ARBITRUM_SEPOLIA = 421614,
  HARDHAT = HardhatChain.HARDHAT,
}

export enum ForeignChains {
  ETHEREUM_MAINNET = 1,
  ETHEREUM_SEPOLIA = 11155111,
  GNOSIS_MAINNET = 100,
  GNOSIS_CHIADO = 10200,
  HARDHAT = HardhatChain.HARDHAT,
}

export enum Courts {
  FORKING = 0,
  GENERAL = 1,
}

export const isDevnet = (network: Network) => network.name.endsWith("Devnet");

export const isSkipped = async (network: Network, skip: boolean) => {
  if (skip) {
    console.error(`Error: incompatible network ${network.name} for this deployment script`);
    return true;
  }
  return false;
};
