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
export const DISPUTE_RESOLVER_ADDRESS = disputeResolverAddress[DEFAULT_CHAIN.id];
export const KLEROS_CORE_ADDRESS = klerosCoreAddress[DEFAULT_CHAIN.id];
export const SORTITION_MODULE_ADDRESS = sortitionModuleAddress[DEFAULT_CHAIN.id];
export const PNK_ADDRESS = pnkAddress[DEFAULT_CHAIN.id];

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
