import type { Abi, Address } from "viem";

import * as generated from "hooks/contracts/generated";

import { CHAIN } from "../../contracts";

export type KnownContract = { name: string; address: Address; abi: Abi };

/** Every generated contract deployed on the mocked chain, used to name unmocked calls in failure messages. */
export const KNOWN_CONTRACTS: KnownContract[] = Object.entries(generated).flatMap(([key, value]) => {
  if (!key.endsWith("Address")) return [];
  const address = (value as Record<number, Address>)[CHAIN.id];
  const abi = (generated as Record<string, unknown>)[key.replace(/Address$/, "Abi")] as Abi | undefined;
  return address && abi ? [{ name: key.replace(/Address$/, ""), address, abi }] : [];
});
