import React from "react";

import { DEFAULT_CHAIN } from "consts/chains";

import ConnectWallet from "components/ConnectWallet";
import { useWallet } from "context/walletProviders";

interface IEnsureChain {
  children: React.ReactElement;
  className?: string;
}

export const EnsureChain: React.FC<IEnsureChain> = ({ children, className }) => {
  const { chainId } = useWallet();

  return chainId === DEFAULT_CHAIN ? children : <ConnectWallet {...{ className }} />;
};
