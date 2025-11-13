import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { AppKitNetwork } from "@reown/appkit/networks";
import { createAppKit, useAppKit, useAppKitNetwork } from "@reown/appkit/react";
import { lightTheme } from "src/styles/themes";
import { arbitrum, arbitrumSepolia, Chain } from "viem/chains";
import { useAccount, useSwitchChain } from "wagmi";
import { createWriteContract } from "wagmi/codegen";
import { DEFAULT_CHAIN, getChain } from "~src/consts/chains";
import { IWalletProvider, WalletProviderHook } from "../../interfaces";
import { WriteContractParametersWithPermits } from "../../types";
import { chains, isProduction, projectId, transports } from "../wagmi";
import { reownAuthenticate } from "./ReownAuthenticate";

export class ReownWalletProvider implements IWalletProvider {
  async writeContract({
    address,
    functionName,
    args,
    value,
    abi,
  }: WriteContractParametersWithPermits): Promise<`0x${string}`> {
    const writeContract = createWriteContract({
      abi,
      address,
      functionName,
    });
    return writeContract(wagmiAdapter.wagmiConfig, { args, value });
  }

  async sendCalls(): Promise<`0x${string}`> {
    throw new Error("sendCalls not available");
  }

  async authenticate(): Promise<void> {
    await reownAuthenticate();
    return;
  }

  async connect(): Promise<void> {
    const { open } = useAppKit();
    return open({ view: "Connect" });
  }

  async logout(): Promise<void> {
    const { close } = useAppKit();
    return close();
  }

  async switchNetwork(chainId: number, setChainId?: (chainId: Chain | undefined) => void): Promise<void> {
    throw new Error("switchNetwork not implemented");
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

  const { address, chainId } = useAccount();
  console.log("useReownWalletProvider render", { address });

  const account = address as `0x${string}` | undefined;

  return {
    writeContract: provider.writeContract.bind(provider),
    authenticate: provider.authenticate.bind(provider),
    connect: provider.connect.bind(provider),
    logout: provider.logout.bind(provider),
    switchNetwork: provider.switchNetwork.bind(provider),
    chainId,
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
