import React from "react";

import { useTranslation } from "react-i18next";

import InfoCircle from "svgs/icons/info-circle.svg";

const Info: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="flex items-start gap-2">
      <InfoCircle className="w-[16px] h-[16px] shrink-0" />
      <span className="text-klerosUIComponentsSecondaryText text-[14px]">{t("misc.past_performance_disclaimer")}</span>
    </div>
  );
};
export default Info;
