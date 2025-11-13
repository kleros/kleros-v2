import { useAppKit } from "@reown/appkit/react";
import { signTypedData, SignTypedDataParameters, switchChain } from "@wagmi/core";
import { getChain } from "src/consts/chains";
import { Chain } from "viem/chains";
import { useAccount } from "wagmi";
import { createWriteContract } from "wagmi/codegen";
import { IWalletProvider, WalletProviderHook } from "../../interfaces";
import { WriteContractParametersWithPermits } from "../../types";
import { reownAuthenticate } from "./ReownAuthenticate";
import { wagmiAdapter } from "./ReownWalletProviderComponent";

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

  async switchNetwork(chainId: number, setChainId?: (chainId: Chain | undefined) => void): Promise<Chain> {
    console.log("switchNetwork in provider", { chainId });
    if (setChainId) {
      setChainId(getChain(chainId)!);
    }

    return switchChain(wagmiAdapter.wagmiConfig, { chainId });
  }

  async signTypedData(params: SignTypedDataParameters): Promise<`0x${string}`> {
    const signature = await signTypedData(wagmiAdapter.wagmiConfig, params);
    return signature;
  }
}

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
    signTypedData: provider.signTypedData.bind(provider),
    chainId,
    ready: true,
    isAuthenticated: false,
    isConnected: account !== undefined,
    account,
    providerType: "reown",
  };
}
