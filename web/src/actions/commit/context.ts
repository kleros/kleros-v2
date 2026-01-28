import type { Address, Chain, WalletClient } from "viem";

export interface CommitContext {
  /** Account of Juror */
  account: Address;
  chain: Chain;
  walletClient: WalletClient;
}
