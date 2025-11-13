import React, { useCallback } from "react";

import { Button } from "@kleros/ui-components-library";

import { DEFAULT_CHAIN, SUPPORTED_CHAINS } from "consts/chains";

import { useWallet, useWalletContext } from "context/walletProviders";
import AccountDisplay from "./AccountDisplay";

export const SwitchChainButton: React.FC<{ className?: string }> = ({ className }) => {
  const { switchNetwork } = useWallet();
  // const handleSwitch = useCallback(() => {
  //   if (!switchNetwork) {
  //     console.error("Cannot switch network. Please do it manually.");
  //     return;
  //   }
  //   try {
  //     console.log("Switching network");
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }, [switchNetwork]);
  return (
    <Button
      {...{ className }}
      // isLoading={isLoading}
      // disabled={isLoading}
      text={`Switch to ${SUPPORTED_CHAINS[DEFAULT_CHAIN].name}`}
      onClick={() => switchNetwork(DEFAULT_CHAIN)}
    />
  );
};

const ConnectButton: React.FC<{ className?: string }> = ({ className }) => {
  const { isConnected, connect, account } = useWallet();
  const { setWallet } = useWalletContext();

  console.log("ConnectButton render", { isConnected, account });
  return (
    <Button {...{ className }} disabled={isConnected} small text={"Connect"} onClick={async () => connect(setWallet)} />
  );
};

const ConnectWallet: React.FC<{ className?: string }> = ({ className }) => {
  const { isConnected, chainId } = useWallet();
  console.log("ConnectWallet render", { isConnected, chainId });

  if (isConnected) {
    if (chainId !== DEFAULT_CHAIN) {
      return <SwitchChainButton {...{ className }} />;
    } else return <AccountDisplay />;
  } else return <ConnectButton {...{ className }} />;
};

export default ConnectWallet;
