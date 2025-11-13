import { MiniAppError, TransactionResult } from "@lemoncash/mini-app-sdk";
import type { Address, Chain, WriteContractParameters } from "viem";

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

export type Permit = {
  owner: Address; // User's wallet address
  token: Address; // ERC20 token address
  spender: Address; // Contract that will spend the tokens
  amount: string; // Amount in smallest unit (wei)
  deadline: string; // Unix timestamp in seconds
  nonce: string; // Unique number
};

export type WriteContractParametersWithPermits = WriteContractParameters & {
  permits?: Permit[];
  contractStandard?: "ERC20" | "ERC721" | "ERC1155";
};

export type CallSmartContractResponse =
  | {
      result: TransactionResult.SUCCESS;
      data: {
        txHash: string;
      };
    }
  | {
      result: TransactionResult.FAILED;
      error: MiniAppError;
    }
  | {
      result: TransactionResult.CANCELLED;
    };

export type WalletProviderType = "reown" | "lemon";
