import type { Address, Chain } from "viem";

export type Call = {
  to: Address;
  data: `0x${string}`;
  value?: bigint;
};

export type SendTransactionParams = {
  chain: Chain;
  to: Address;
  // biome-ignore lint/suspicious/noExplicitAny: _
  abi?: any;
  functionName?: string;
  functionParams?: unknown[];
  value?: bigint;
};

export type WalletProviderType = "reown" | "lemon";
