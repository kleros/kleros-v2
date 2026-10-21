import React, { useCallback, useEffect } from "react";

import { usePrivy } from "@privy-io/react-auth";
import { useAccount, useSwitchChain } from "wagmi";

import { Button } from "@kleros/ui-components-library";

import { SUPPORTED_CHAINS, DEFAULT_CHAIN } from "consts/chains";
import { useEmbeddedWallet } from "hooks/useIsEmbeddedWallet";
import { useLogout } from "hooks/useLogout";

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
  const { ready, authenticated, connectOrCreateWallet } = usePrivy();
  const logout = useLogout();

  // `connectOrCreateWallet()` logs email/Google users in (creating their embedded wallet) but only connects
  // external wallets, so they are not asked for a Privy SIWE signature. This button only renders without a
  // wagmi connection, so a Privy session still authenticated here is stale (e.g. wagmi was disconnected on its
  // own): clear it first.
  const handleConnect = useCallback(async () => {
    if (authenticated) await logout();
    connectOrCreateWallet();
  }, [authenticated, logout, connectOrCreateWallet]);

  return <Button {...{ className }} disabled={!ready} small text={"Connect"} onClick={handleConnect} />;
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
