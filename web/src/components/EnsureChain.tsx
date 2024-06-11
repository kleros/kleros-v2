import React from "react";

import { useNetwork } from "wagmi";

import { DEFAULT_CHAIN } from "consts/chains";

import ConnectWallet from "components/ConnectWallet";

interface IEnsureChain {
  children: React.ReactElement;
  className?: string;
}

export const EnsureChain: React.FC<IEnsureChain> = ({ children, className }) => {
  const { chain } = useNetwork();

  return chain && chain.id === DEFAULT_CHAIN ? children : <ConnectWallet {...{ className }} />;
};
