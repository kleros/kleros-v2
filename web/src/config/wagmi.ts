import { AppKitNetwork } from "@reown/appkit/networks";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

import { ALL_CHAINS } from "consts/chains";

import { transports } from "./rpc";

const chains = ALL_CHAINS as [AppKitNetwork, ...AppKitNetwork[]];

const projectId = import.meta.env.WALLETCONNECT_PROJECT_ID;
if (!projectId) {
  throw new Error("WalletConnect project ID is not set in WALLETCONNECT_PROJECT_ID environment variable.");
}

export const wagmiAdapter = new WagmiAdapter({
  networks: chains,
  projectId,
  transports,
  //   connectors: isLocalhost ? [mock({ accounts: ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"] })] : [],
});
