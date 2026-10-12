import { arbitrumSepolia } from "viem/chains";

import {
  disputeKitClassicAbi,
  disputeKitClassicAddress,
  disputeResolverAbi,
  disputeResolverAddress,
  evidenceModuleAbi,
  evidenceModuleAddress,
  klerosCoreAbi,
  klerosCoreAddress,
  pnkAbi,
  pnkAddress,
  pnkFaucetAbi,
  pnkFaucetAddress,
  sortitionModuleAbi,
  sortitionModuleAddress,
} from "hooks/contracts/generated";

/** The mocked build is a devnet build (.env.e2e.public), so every contract lives on Arbitrum Sepolia. */
export const CHAIN = arbitrumSepolia;
const id = CHAIN.id;

export const klerosCore = { address: klerosCoreAddress[id], abi: klerosCoreAbi } as const;
export const disputeKitClassic = { address: disputeKitClassicAddress[id], abi: disputeKitClassicAbi } as const;
export const disputeResolver = { address: disputeResolverAddress[id], abi: disputeResolverAbi } as const;
export const evidenceModule = { address: evidenceModuleAddress[id], abi: evidenceModuleAbi } as const;
export const pnk = { address: pnkAddress[id], abi: pnkAbi } as const;
export const pnkFaucet = { address: pnkFaucetAddress[id], abi: pnkFaucetAbi } as const;
export const sortitionModule = { address: sortitionModuleAddress[id], abi: sortitionModuleAbi } as const;
