import type { Chain } from "viem";
import { Config } from "wagmi";
import { SwitchChainMutate } from "wagmi/query";
import type { WalletProviderType, WriteContractParametersWithPermits } from "../types";

/**
 * Core interface that all wallet providers must implement
 */
export interface IWalletProvider {
  writeContract(params: WriteContractParametersWithPermits): Promise<`0x${string}`>;

  authenticate(
    setWallet?: (wallet: string | undefined) => void,
    setConnected?: (connected: boolean) => void
  ): Promise<void>;

  connect(setWallet?: (wallet: string | undefined) => void, setConnected?: (connected: boolean) => void): Promise<void>;

  logout(setWallet?: (wallet: string | undefined) => void, setConnected?: (connected: boolean) => void): Promise<void>;

  switchNetwork(chainId: number, setChainId?: (chainId: Chain | undefined) => void): Promise<Chain>;
}

/**
 * Hook interface for React components
 */
export interface WalletProviderHook {
  writeContract: IWalletProvider["writeContract"];
  authenticate: IWalletProvider["authenticate"];
  connect: IWalletProvider["connect"];
  logout: IWalletProvider["logout"];
  ready: boolean;
  isAuthenticated: boolean;
  isConnected: boolean;
  account: `0x${string}` | undefined;
  chainId: number | undefined;
  providerType: WalletProviderType;
  // todo: fix types
  signTypedData: (params: {
    domain: unknown;
    types: unknown;
    primaryType: string;
    message: unknown;
  }) => Promise<{ signature: `0x${string}` }>;
  setWallet?: (wallet: string | undefined) => void;
  setConnected?: (connected: boolean) => void;
  switchNetwork: (chainId: number) => Promise<Chain>;
}
