import React from "react";

import { useTranslation } from "react-i18next";

import ArrowIcon from "svgs/icons/arrow.svg";

import { cn } from "utils/cn";

import { AddressOrName, IdenticonOrAvatar } from "components/ConnectWallet/AccountDisplay";
import { StyledArrowLink } from "components/StyledArrowLink";

import { ISettings } from "../../../index";

const WalletAndProfile: React.FC<ISettings> = ({ toggleIsSettingsOpen }) => {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        "[transition:0.2s] flex justify-center items-center p-[16px_32px] gap-6",
        "border border-solid border-klerosUIComponentsStroke rounded-[30px]",
        "[&>label]:text-klerosUIComponentsPrimaryText [&>label]:text-[16px] [&>label]:font-semibold",
        "[&:hover]:bg-klerosUIComponentsLightBlue"
      )}
    >
      <div className="flex flex-row gap-2">
        <IdenticonOrAvatar />
        <AddressOrName />
      </div>
      <StyledArrowLink
        to={"/profile/stakes/1"}
        onClick={toggleIsSettingsOpen}
        className="text-[14px] [&>svg]:h-[14px] [&>svg]:w-[14px]"
      >
        {t("navigation.my_profile")} <ArrowIcon />
      </StyledArrowLink>
    </div>
  );
};
export default WalletAndProfile;
