import React, { useCallback, useState } from "react";

import { useWeb3Modal, useWeb3ModalState } from "@web3modal/wagmi/react";
import { useAccount, useSwitchChain } from "wagmi";

import { Button } from "@kleros/ui-components-library";

import { SUPPORTED_CHAINS, DEFAULT_CHAIN } from "consts/chains";

export const SwitchChainButton: React.FC<{ className?: string }> = ({ className }) => {
  // TODO isLoading is not documented, but exists in the type, might have changed to isPending
  const { switchChain, isLoading } = useSwitchChain();
  const [, setError] = useState<string | null>(null);
  const handleSwitch = useCallback(() => {
    if (!switchChain) {
      setError("Cannot switch network. Please do it manually.");
      return;
    }
    try {
      switchChain({ chainId: DEFAULT_CHAIN });
    } catch (err) {
      setError(err as string);
    }
  }, [switchChain, setError]);
  return (
    <Button
      {...{ className }}
      isLoading={isLoading}
      disabled={isLoading}
      text={`Switch to ${SUPPORTED_CHAINS[DEFAULT_CHAIN].name}`}
      onClick={handleSwitch}
    />
  );
};

const ConnectButton: React.FC<{ className?: string }> = ({ className }) => {
  const { open } = useWeb3Modal();
  const { open: isOpen } = useWeb3ModalState();
  return (
    <Button
      {...{ className }}
      disabled={isOpen}
      small
      text={"Connect"}
      onClick={async () => open({ view: "Connect" })}
    />
  );
};

const ConnectWallet: React.FC<{ className?: string }> = ({ className }) => {
  const { isConnected, chainId } = useAccount();

  if (isConnected && chainId !== DEFAULT_CHAIN) {
    return <SwitchChainButton {...{ className }} />;
  } else return <ConnectButton {...{ className }} />;
};

export default ConnectWallet;
