import React from "react";

import { useTranslation } from "react-i18next";

import useIsDesktop from "hooks/useIsDesktop";

import WithHelpTooltip from "components/WithHelpTooltip";

const Score: React.FC = () => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  return (
    <div className="flex items-center text-[12px]! text-klerosUIComponentsSecondaryText lg:text-[14px]! lg:justify-center">
      {t("juror_levels.score")}
      <WithHelpTooltip
        place={isDesktop ? "top" : "right"}
        tooltipMsg={t("juror_levels.score_tooltip")}
      ></WithHelpTooltip>
    </div>
  );
};
export default Score;
