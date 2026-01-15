import React, { useCallback } from "react";

import { useAppKit, useAppKitState } from "@reown/appkit/react";
import { useTranslation } from "react-i18next";
import { useAccount, useSwitchChain } from "wagmi";

import { Button } from "@kleros/ui-components-library";

import { SUPPORTED_CHAINS, DEFAULT_CHAIN } from "consts/chains";

import AccountDisplay from "./AccountDisplay";

export const SwitchChainButton: React.FC<{ className?: string }> = ({ className }) => {
  const { t } = useTranslation();
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
      text={t("buttons.switch_to_chain", { chainName: SUPPORTED_CHAINS[DEFAULT_CHAIN].name })}
      onClick={handleSwitch}
    />
  );
};

const ConnectButton: React.FC<{ className?: string }> = ({ className }) => {
  const { t } = useTranslation();
  const { open } = useAppKit();
  const { open: isOpen } = useAppKitState();
  return (
    <Button
      {...{ className }}
      disabled={isOpen}
      small
      text={t("buttons.connect")}
      onClick={async () => open({ view: "Connect" })}
    />
  );
};

const ConnectWallet: React.FC<{ className?: string }> = ({ className }) => {
  const { isConnected, chainId } = useAccount();

  if (isConnected) {
    if (chainId !== DEFAULT_CHAIN) {
      return <SwitchChainButton {...{ className }} />;
    } else return <AccountDisplay />;
  } else return <ConnectButton {...{ className }} />;
};

export default ConnectWallet;
