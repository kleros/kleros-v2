import React from "react";

import { useTranslation } from "react-i18next";

export const MobileHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex w-full bg-klerosUIComponentsLightBlue border border-solid border-klerosUIComponentsStroke [border-top-left-radius:3px] [border-top-right-radius:3px] p-4 mt-[calc(12px_+_(16_-_12)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] lg:hidden">
      <label className="text-[14px] text-klerosUIComponentsSecondaryText">{t("profile.staking_history")}</label>
    </div>
  );
};
