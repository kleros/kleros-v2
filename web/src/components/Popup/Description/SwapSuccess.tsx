import React from "react";

import { useTranslation } from "react-i18next";

import ArrowIcon from "svgs/icons/arrow.svg";
import PnkIcon from "svgs/tokens/pnk.svg";

import { cn } from "utils/cn";

import { Divider } from "components/Divider";
import LightButton from "components/LightButton";

interface ISwapSuccess {
  hash: string;
  amount: string;
  isClaim?: boolean;
}

const SwapSuccess: React.FC<ISwapSuccess> = ({ hash, amount, isClaim }) => {
  const { t } = useTranslation();
  const baseUrl = `https://sepolia.arbiscan.io/tx/${hash}`;
  return (
    <div className="flex flex-col items-center mb-6 mt-8 gap-6">
      <div className="flex items-center h-fit gap-[calc(16px_+_(32_-_16)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]">
        <h1
          className={cn(
            "text-klerosUIComponentsSecondaryPurple",
            "text-[calc(32px_+_(64_-_32)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] m-0"
          )}
        >
          {amount} PNK
        </h1>
        <div
          className={cn(
            "w-[calc(30px_+_(50_-_30)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]",
            "h-[calc(30px_+_(50_-_30)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]"
          )}
        >
          <PnkIcon />
        </div>
      </div>
      {isClaim ? (
        <label className="flex">{t("swap.claimed_testnet", { amount })}</label>
      ) : (
        <label className="flex">{t("swap.bridge_from_to", { from: "Ethereum", to: "Arbitrum" })}</label>
      )}
      <Divider className="m-[calc(32px_+_(64_-_32)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))_0px_0px]" />
      <LightButton
        onPress={() => window.open(baseUrl, "_blank", "rel=noopener noreferrer")}
        text={t("buttons.view_transaction_etherscan")}
        Icon={ArrowIcon}
        className="flex [flex-direction:row-reverse] gap-2 [&>.button-text]:text-klerosUIComponentsPrimaryBlue pt-0"
      />
    </div>
  );
};

export default SwapSuccess;
