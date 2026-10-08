import React from "react";

import { useTranslation } from "react-i18next";

import useIsDesktop from "hooks/useIsDesktop";

import WithHelpTooltip from "components/WithHelpTooltip";

const Coherence: React.FC = () => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const text = t("juror_levels.coherent_votes").replace(/ /g, "\u00A0");

  return (
    <div className="flex items-center text-[12px]! text-klerosUIComponentsSecondaryText lg:text-[14px]! lg:justify-center">
      {text}
      <WithHelpTooltip
        place={isDesktop ? "top" : "right"}
        tooltipMsg={t("juror_levels.coherent_votes_ratio_tooltip")}
      ></WithHelpTooltip>
    </div>
  );
};
export default Coherence;
