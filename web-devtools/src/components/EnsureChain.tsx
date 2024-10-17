import React, { useEffect, useState } from "react";

import { useAccount } from "wagmi";

import { DEFAULT_CHAIN } from "consts/chains";

import ConnectWallet from "components/ConnectWallet";

interface IEnsureChain {
  children: React.ReactElement;
  className?: string;
}

export const EnsureChain: React.FC<IEnsureChain> = ({ children, className }) => {
  const { chainId } = useAccount();
  const [isClient, setIsClient] = useState(false);

  // hydration error workaround, in server pre-render chainId is undefined so it mismatches with the client's initial render
  useEffect(() => setIsClient(true), []);

  if (!isClient) return children;

  return chainId === DEFAULT_CHAIN ? children : <ConnectWallet {...{ className }} />;
};
