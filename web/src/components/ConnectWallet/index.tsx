import React from "react";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import { useWeb3Modal } from "@web3modal/react";
import { Button } from "@kleros/ui-components-library";
import { SUPPORTED_CHAINS, DEFAULT_CHAIN } from "consts/chains";
import AccountDisplay from "./AccountDisplay";

export const SwitchChainButton: React.FC = () => {
  const { switchNetwork, isLoading } = useSwitchNetwork();
  const handleSwitch = () => {
    if (!switchNetwork) {
      console.error("Cannot switch network. Please do it manually.");
      return;
    }
    try {
      switchNetwork(DEFAULT_CHAIN);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <Button
      isLoading={isLoading}
      disabled={isLoading}
      text={`Switch to ${SUPPORTED_CHAINS[DEFAULT_CHAIN].name}`}
      onClick={handleSwitch}
    />
  );
};

const ConnectButton: React.FC = () => {
  const { open, isOpen } = useWeb3Modal();
  return <Button disabled={isOpen} small text={"Connect"} onClick={async () => open({ route: "ConnectWallet" })} />;
};

const ConnectWallet: React.FC = () => {
  const { chain } = useNetwork();
  const { isConnected } = useAccount();
  if (isConnected) {
    if (chain && chain.id !== DEFAULT_CHAIN) {
      return <SwitchChainButton />;
    } else return <AccountDisplay />;
  } else return <ConnectButton />;
};

export default ConnectWallet;
