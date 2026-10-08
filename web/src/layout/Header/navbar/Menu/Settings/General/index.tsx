import React from "react";

import { useTranslation } from "react-i18next";
import { useAccount, useDisconnect } from "wagmi";

import { Button } from "@kleros/ui-components-library";

import { ChainDisplay } from "components/ConnectWallet/AccountDisplay";
import { EnsureChain } from "components/EnsureChain";
import { LanguageSelector } from "components/LanguageSelector";

import { ISettings } from "../../../index";

import WalletAndProfile from "./WalletAndProfile";

export const DisconnectWalletButton: React.FC = () => {
  const { t } = useTranslation();
  const { disconnect } = useDisconnect();
  return <Button small text={t("buttons.disconnect")} onPress={() => disconnect()} />;
};

const General: React.FC<ISettings> = ({ toggleIsSettingsOpen }) => {
  const { address } = useAccount();

  return (
    <>
      <div className="w-full box-border p-[24px_16px_0]">
        <LanguageSelector />
      </div>
      <div className="flex justify-center pt-6 pb-5">
        <EnsureChain>
          <div className="flex flex-col justify-center">
            {address && (
              <div className="flex flex-col gap-4">
                <div
                  className={
                    'flex gap-[0.5rem] justify-center items-center [&:before]:[content:""] [&:before]:w-[8px] [&:before]:h-[8px] [&:before]:rounded-[50%] [&:before]:bg-klerosUIComponentsSuccess [&>label]:text-klerosUIComponentsSuccess'
                  }
                >
                  <ChainDisplay />
                </div>
                <WalletAndProfile {...{ toggleIsSettingsOpen }} />
                <div className="flex justify-center mt-2">
                  <DisconnectWalletButton />
                </div>
              </div>
            )}
          </div>
        </EnsureChain>
      </div>
    </>
  );
};

export default General;
