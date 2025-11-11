import React, { type ReactNode } from "react";
import { WalletContext, type WalletContextType } from ".";

interface WalletProviderProps {
  children: ReactNode;
  value: WalletContextType;
}

export function WalletProvider({ children, value }: WalletProviderProps) {
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}
