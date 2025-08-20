import { arbitrum, arbitrumSepolia } from "viem/chains";

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
  mainnetNeo: {
    chainId: arbitrum.id,
  },
} as const;

export type DeploymentName = keyof typeof deployments;

export type ContractConfig = {
  address: Record<number, `0x${string}`>;
  abi: readonly any[];
};

export function getAddress(config: ContractConfig, chainId: number): `0x${string}` {
  const address = config.address[chainId];
  if (!address) throw new Error(`No address found for chainId ${chainId}`);
  return address;
}
