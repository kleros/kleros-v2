import React from "react";

import { useTranslation } from "react-i18next";

import useIsDesktop from "hooks/useIsDesktop";

import WithHelpTooltip from "components/WithHelpTooltip";

const Rewards: React.FC = () => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  return (
    <div className="flex text-klerosUIComponentsSecondaryText gap-0 text-[12px]! lg:text-[14px]! lg:justify-center">
      <span className="lg:hidden">{t("juror_levels.rewards")}</span>
      <span className="hidden lg:inline">{t("juror_levels.total_rewards")}</span>
      <WithHelpTooltip
        place={isDesktop ? "top" : "right"}
        tooltipMsg={t("juror_levels.total_rewards_tooltip")}
      ></WithHelpTooltip>
    </div>
  );
};

export default Rewards;
