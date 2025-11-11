import { createContext } from "react";
import type { WalletProviderHook } from "../interfaces";

export * from "./WalletContext";

export interface WalletContextType extends WalletProviderHook {
  wallet?: string | undefined;
  setWallet: (wallet: string | undefined) => void;
}

export const WalletContext = createContext<WalletContextType | null>(null);

export * from "./useWalletContext";
