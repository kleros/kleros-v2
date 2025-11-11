import type { Chain } from "viem";
import type { Call, SendTransactionParams, WalletProviderType } from "../types";

/**
 * Core interface that all wallet providers must implement
 */
export interface IWalletProvider {
  sendTransaction(params: SendTransactionParams): Promise<`0x${string}`>;

  sendCalls(params: { chain: Chain; calls: Call[] }): Promise<`0x${string}`>;

  authenticate(
    setWallet?: (wallet: string | undefined) => void,
    setConnected?: (connected: boolean) => void
  ): Promise<void>;

  connect(setWallet?: (wallet: string | undefined) => void, setConnected?: (connected: boolean) => void): Promise<void>;

  logout(setWallet?: (wallet: string | undefined) => void, setConnected?: (connected: boolean) => void): Promise<void>;

  switchNetwork(chainId: number, setChainId?: (chainId: Chain | undefined) => void): Promise<void>;
}

/**
 * Hook interface for React components
 */
export interface WalletProviderHook {
  sendTransaction: IWalletProvider["sendTransaction"];
  sendCalls: IWalletProvider["sendCalls"];
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
  switchNetwork: (chainId: number) => Promise<void>;
}
