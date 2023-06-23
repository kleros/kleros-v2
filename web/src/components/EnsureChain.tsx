import React from "react";
import { DEFAULT_CHAIN } from "consts/chains";
import { useNetwork } from "wagmi";
import ConnectWallet from "components/ConnectWallet";

interface IEnsureChain {
  children: React.ReactElement;
}

export const EnsureChain: React.FC<IEnsureChain> = ({ children }) => {
  const { chain } = useNetwork();

  return chain && chain.id === DEFAULT_CHAIN ? children : <ConnectWallet />;
};
