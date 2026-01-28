import { AppKitNetwork } from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { mock, MockParameters } from "@wagmi/core";
import { Address, Hex, isAddress } from "viem";
import { privateKeyToAddress } from "viem/accounts";

import { configureSDK } from "@kleros/kleros-sdk/src/sdk";

import { ALL_CHAINS, DEFAULT_CHAIN } from "consts/chains";

import { lightTheme } from "styles/themes";

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
});
configureSDK({
  client: {
    chain: DEFAULT_CHAIN,
    transport: transports[DEFAULT_CHAIN.id],
  },
});

export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: chains,
  defaultNetwork: DEFAULT_CHAIN,
  projectId,
  allowUnsupportedChain: true,
  themeVariables: {
    "--w3m-color-mix": lightTheme.primaryPurple,
    "--w3m-color-mix-strength": 20,
    // overlay portal is at 9999
    "--w3m-z-index": 10000,
  },
  features: {
    // adding these here to toggle in futute if needed
    // email: false,
    // socials: false,
    // onramp:false,
    // swap: false
  },
});

export const createMockAdapter = async (addressOrPrivateKey: Address | Hex, features?: MockParameters["features"]) => {
  const address = isAddress(addressOrPrivateKey) ? addressOrPrivateKey : privateKeyToAddress(addressOrPrivateKey);

  // if on hardhat, allow sending txn from this address too.
  // This can be later used to impersonate signable account on mainnet fork too
  //   if (isLocalDeployment()) {
  //     const testClient = createTestClient({
  //       chain: hardhat,
  //       mode: "hardhat",
  //       transport: http(),
  //     });
  //     await testClient.impersonateAccount({ address });
  //     await testClient.setBalance({
  //       address,
  //       value: parseEther("1000"),
  //     });
  //   }
  return new WagmiAdapter({
    connectors: [mock({ accounts: [address], features })],
    networks: chains,
    projectId,
    transports,
  });
};
