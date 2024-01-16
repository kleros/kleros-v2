import React, { useCallback } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { useWeb3Modal } from "@web3modal/react";
import { Button } from "@kleros/ui-components-library";
import { SUPPORTED_CHAINS, DEFAULT_CHAIN } from "consts/chains";
import AccountDisplay from "./AccountDisplay";

export const SwitchChainButton: React.FC = () => {
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
  const chainId = useChainId();
  const { isConnected } = useAccount();
  if (isConnected) {
    if (chainId !== DEFAULT_CHAIN) {
      return <SwitchChainButton />;
    } else return <AccountDisplay />;
  } else return <ConnectButton />;
};

export default ConnectWallet;
