import type { ReactNode } from "react";
import React from "react";
import type { WalletProviderType } from "../types";
import { LemonWalletProviderComponent } from "./lemon/LemonWalletProviderComponent";
import ReownWalletProviderComponent from "./reown/ReownWalletProviderComponent";

interface WalletProviderProps {
  children: ReactNode;
  type: WalletProviderType;
}

export function WalletProvider({ children, type }: WalletProviderProps) {
  switch (type) {
    case "reown":
      return <ReownWalletProviderComponent>{children}</ReownWalletProviderComponent>;

    case "lemon":
      return <LemonWalletProviderComponent>{children}</LemonWalletProviderComponent>;

    default:
      throw new Error(`Unsupported wallet provider type: ${type}`);
  }
}
