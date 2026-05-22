import { Abi, Address } from "viem";

import {
  disputeResolverAbi,
  disputeResolverAddress,
  klerosCoreAbi,
  klerosCoreAddress,
  pnkAbi,
  pnkAddress,
  sortitionModuleAbi,
  sortitionModuleAddress,
} from "hooks/contracts/generated";

import { DEFAULT_CHAIN } from ".";

// Contract addresses for default chain
// for future , if we want to add devnet facing tests , will need changes
const chainId = DEFAULT_CHAIN.id as keyof typeof disputeResolverAddress;
export const DISPUTE_RESOLVER_ADDRESS = disputeResolverAddress[chainId];
export const KLEROS_CORE_ADDRESS = klerosCoreAddress[chainId as keyof typeof klerosCoreAddress];
export const SORTITION_MODULE_ADDRESS = sortitionModuleAddress[chainId as keyof typeof sortitionModuleAddress];
export const PNK_ADDRESS = pnkAddress[chainId as keyof typeof pnkAddress];

type ContractConfig<T extends Abi> = {
  address: Address;
  abi: T;
};

export const sortitionModuleContractConfig = {
  address: SORTITION_MODULE_ADDRESS,
  abi: sortitionModuleAbi,
} satisfies ContractConfig<typeof sortitionModuleAbi>;

export const klerosCoreContractConfig = {
  address: KLEROS_CORE_ADDRESS,
  abi: klerosCoreAbi,
} satisfies ContractConfig<typeof klerosCoreAbi>;

export const disputeResolverContractConfig = {
  address: DISPUTE_RESOLVER_ADDRESS,
  abi: disputeResolverAbi,
} satisfies ContractConfig<typeof disputeResolverAbi>;

export const pnkTokenContractConfig = {
  address: PNK_ADDRESS,
  abi: pnkAbi,
} satisfies ContractConfig<typeof pnkAbi>;
