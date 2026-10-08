import React from "react";

import { useTranslation } from "react-i18next";

const Header: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex w-full bg-klerosUIComponentsLightBlue border border-solid border-klerosUIComponentsStroke [border-top-left-radius:3px] [border-top-right-radius:3px] p-[16px_20px] justify-between mt-[calc(12px_+_(16_-_12)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]">
      <label className="text-[14px] text-klerosUIComponentsSecondaryText">{t("misc.juror")}</label>
      <label className="text-[14px] text-klerosUIComponentsSecondaryText">{t("misc.pnk_staked")}</label>
    </div>
  );
};

export default Header;
