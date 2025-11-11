import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { createAppKit, useAppKit } from "@reown/appkit/react";
import { lightTheme } from "src/styles/themes";
import { arbitrum, arbitrumSepolia } from "viem/chains";
import { useAccount } from "wagmi";
import { IWalletProvider, WalletProviderHook } from "../../interfaces";
import { SendTransactionParams } from "../../types";
import { chains, isProduction, projectId, transports } from "../wagmi";
import { reownAuthenticate } from "./ReownAuthenticate";

export class ReownWalletProvider implements IWalletProvider {
  async sendTransaction({ to, functionName, functionParams, value }: SendTransactionParams): Promise<`0x${string}`> {
    throw new Error("Not Implemented");
  }

  async sendCalls(): Promise<`0x${string}`> {
    throw new Error("sendCalls not available");
  }

  async authenticate(): Promise<void> {
    await reownAuthenticate();
  }

  async connect(): Promise<void> {
    const { open } = useAppKit();
    open({ view: "Connect" });
  }

  async logout(): Promise<void> {
    const { close } = useAppKit();
    close();
  }
}

const wagmiAdapter = new WagmiAdapter({
  networks: chains,
  projectId,
  transports,
});

createAppKit({
  adapters: [wagmiAdapter],
  networks: chains,
  defaultNetwork: isProduction ? arbitrum : arbitrumSepolia,
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

export function useReownWalletProvider(): WalletProviderHook {
  const provider = new ReownWalletProvider();

  const { address } = useAccount();
  console.log("useReownWalletProvider render", { address });

  const account = address as `0x${string}` | undefined;

  return {
    sendTransaction: provider.sendTransaction.bind(provider),
    sendCalls: provider.sendCalls.bind(provider),
    authenticate: provider.authenticate.bind(provider),
    connect: provider.connect.bind(provider),
    logout: provider.logout.bind(provider),
    ready: true,
    isAuthenticated: false,
    isConnected: account !== undefined,
    account,
    providerType: "reown",
    signTypedData: () => {
      throw new Error("signTypedData not available");
    },
  };
}
