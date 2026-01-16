import type { Address, Chain, WalletClient } from "viem";

export interface RevealContext {
  /** Account of Juror */
  account: Address;
  chain: Chain;
  walletClient: WalletClient;
}
