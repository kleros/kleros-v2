import type { Address, Chain, WalletClient } from "viem";

export interface VoteContext {
  /** Account of Juror */
  account: Address;
  chain: Chain;
  walletClient: WalletClient;
}
