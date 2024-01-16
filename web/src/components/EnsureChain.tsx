import React from "react";
import { DEFAULT_CHAIN } from "consts/chains";
import { useChainId } from "wagmi";
import ConnectWallet from "components/ConnectWallet";

interface IEnsureChain {
  children: React.ReactElement;
}

export const EnsureChain: React.FC<IEnsureChain> = ({ children }) => {
  const chainId = useChainId();

  return chainId === DEFAULT_CHAIN ? children : <ConnectWallet />;
};
