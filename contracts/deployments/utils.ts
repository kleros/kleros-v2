import { arbitrum, arbitrumSepolia } from "viem/chains";
import type { Abi } from "viem";

export const deployments = {
  devnet: {
    chainId: arbitrumSepolia.id,
  },
  university: {
    chainId: arbitrumSepolia.id,
  },
  testnet: {
    chainId: arbitrumSepolia.id,
  },
  mainnet: {
    chainId: arbitrum.id,
  },
} as const;

export type DeploymentName = keyof typeof deployments;

export type ContractConfig = {
  address: Record<number, `0x${string}`>;
  abi: Abi;
};

export function getAddress(config: ContractConfig, chainId: number): `0x${string}` {
  const address = config.address[chainId];
  if (!address) throw new Error(`No address found for chainId ${chainId}`);
  return address;
}
