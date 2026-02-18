import type { Address, Chain, WalletClient } from "viem";

export interface FundAppealContext {
  /** Account of Juror */
  account: Address;
  chain: Chain;
  walletClient: WalletClient;
}
