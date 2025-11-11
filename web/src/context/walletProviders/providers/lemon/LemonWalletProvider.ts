import { callSmartContract, isWebView, TransactionResult } from "@lemoncash/mini-app-sdk";
import { useState } from "react";
import { arbitrum, arbitrumSepolia } from "viem/chains";
import { useWalletContext } from "../../context";
import type { IWalletProvider, WalletProviderHook } from "../../interfaces";
import type { SendTransactionParams } from "../../types";
import { isProduction } from "../wagmi";
import { lemonAuthenticate } from "./LemonAuthenticate";

export class LemonWalletProvider implements IWalletProvider {
  async sendTransaction({ to, functionName, functionParams, value }: SendTransactionParams): Promise<`0x${string}`> {
    const result = await callSmartContract({
      contractAddress: to,
      functionName: functionName!,
      functionParams: functionParams!,
      value: value?.toString(),
    });

    if (result.result === TransactionResult.SUCCESS) {
      return result.data.txHash;
    }

    if (result.result === TransactionResult.FAILED) {
      throw new Error(result.error.message);
    }

    throw new Error("Transaction Cancelled");
  }

  async sendCalls(): Promise<`0x${string}`> {
    throw new Error("sendCalls not available");
  }

  async authenticate(
    setWallet: (wallet: string | undefined) => void,
    setConnected: (connected: boolean) => void
  ): Promise<void> {
    await this.connect(setWallet, setConnected);
  }

  async connect(
    setWallet: (wallet: string | undefined) => void,
    setConnected: (connected: boolean) => void
  ): Promise<void> {
    console.log("Starting Lemon authenticate");

    try {
      // TODO: Remove hardcoded wallet after implementing backend verification
      // if (!isWebView()) throw new Error("Lemon authenticate only available in Lemon MiniApp");
      // const wallet = await lemonAuthenticate();
      const wallet = "0xC9534a59EF121516e5E1aEaD8d45D151e768E216" as `0x${string}`;
      console.log("Lemon authenticate successful", { wallet });
      if (wallet !== undefined) {
        setWallet(wallet);
        setConnected(true);
      }
    } catch (error) {
      console.error("Lemon authenticate failed", { error });
    }
  }

  async logout(
    setWallet: (wallet: string | undefined) => void,
    setConnected: (connected: boolean) => void
  ): Promise<void> {
    setWallet(undefined);
    setConnected(false);
  }

  async switchNetwork(): Promise<void> {
    // No need to switch networks, Lemon only works on predefined network (arbitrum / arbitrum sepolia)
    return;
  }

  async signTypedData(): Promise<{ signature: `0x${string}` }> {
    // TODO: RETURN REAL SIGNATURE!
    return { signature: `0x123456787654321` as `0x${string}` };
  }
}

export function createLemonWalletProvider(
  wallet: string | undefined,
  setWallet: (wallet: string | undefined) => void,
  isConnected?: boolean,
  setConnected?: (connected: boolean) => void
): WalletProviderHook {
  const provider = new LemonWalletProvider();

  const isAuthenticated = wallet !== undefined;
  // update isConnected to match isAuthenticated
  isConnected = isAuthenticated;
  const account = wallet as `0x${string}` | undefined;

  const chainId = isProduction ? arbitrum.id : arbitrumSepolia.id;

  console.log("createLemonWalletProvider", { isAuthenticated, isConnected, account });
  return {
    sendTransaction: provider.sendTransaction.bind(provider),
    sendCalls: provider.sendCalls.bind(provider),
    authenticate: provider.authenticate.bind(provider),
    connect: provider.connect.bind(provider),
    logout: provider.logout.bind(provider),
    switchNetwork: provider.switchNetwork.bind(provider),
    signTypedData: provider.signTypedData.bind(provider),
    ready: true,
    isAuthenticated,
    isConnected: isAuthenticated,
    account,
    chainId,
    providerType: "lemon",
    setWallet,
    setConnected,
  };
}

export function useLemonWalletProvider(): WalletProviderHook {
  const { wallet, setWallet } = useWalletContext();
  const [isConnected, setIsConnected] = useState<boolean>(wallet !== undefined);
  console.log("useLemonWalletProvider", { wallet, isConnected });
  return createLemonWalletProvider(wallet, setWallet!, isConnected, setIsConnected);
}
