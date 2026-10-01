import React, { useCallback, useEffect } from "react";

import { usePrivy } from "@privy-io/react-auth";
import { useAccount, useSwitchChain } from "wagmi";

import { Button } from "@kleros/ui-components-library";

import { SUPPORTED_CHAINS, DEFAULT_CHAIN } from "consts/chains";
import { useEmbeddedWallet } from "hooks/useIsEmbeddedWallet";

import AccountDisplay from "./AccountDisplay";

export const SwitchChainButton: React.FC<{ className?: string }> = ({ className }) => {
  // TODO isLoading is not documented, but exists in the type, might have changed to isPending
  const { switchChain, isLoading } = useSwitchChain();
  const handleSwitch = useCallback(() => {
    if (!switchChain) {
      console.error("Cannot switch network. Please do it manually.");
      return;
    }
    try {
      switchChain({ chainId: DEFAULT_CHAIN });
    } catch (err) {
      console.error(err);
    }
  }, [switchChain]);
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
  const { ready, login } = usePrivy();
  return <Button {...{ className }} disabled={!ready} small text={"Connect"} onClick={() => login()} />;
};

const ConnectWallet: React.FC<{ className?: string }> = ({ className }) => {
  const { isConnected, chainId } = useAccount();
  const embeddedWallet = useEmbeddedWallet();
  const isWrongChain = chainId !== DEFAULT_CHAIN;

  // Embedded (web2) users never see a network prompt: the Privy wallet is switched silently.
  useEffect(() => {
    if (embeddedWallet && isWrongChain) embeddedWallet.switchChain(DEFAULT_CHAIN).catch(console.error);
  }, [embeddedWallet, isWrongChain]);

  if (isConnected) {
    if (isWrongChain && !embeddedWallet) {
      return <SwitchChainButton {...{ className }} />;
    } else return <AccountDisplay />;
  } else return <ConnectButton {...{ className }} />;
};

export default ConnectWallet;
