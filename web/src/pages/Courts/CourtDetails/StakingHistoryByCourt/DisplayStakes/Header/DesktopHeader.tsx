import React from "react";

import { useTranslation } from "react-i18next";

import { cn } from "utils/cn";

import WithHelpTooltip from "components/WithHelpTooltip";

const StyledLabel = React.forwardRef<React.ElementRef<"label">, React.ComponentPropsWithoutRef<"label">>(
  function StyledLabel({ className, ...props }, ref) {
    return <label {...props} ref={ref} className={cn("text-[14px] text-klerosUIComponentsSecondaryText", className)} />;
  }
);

export const DesktopHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="hidden w-full bg-klerosUIComponentsLightBlue border border-solid border-klerosUIComponentsStroke [border-top-left-radius:3px] [border-top-right-radius:3px] p-[16px_20px] mt-[calc(12px_+_(16_-_12)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] gap-3 lg:flex">
      <StyledLabel className="flex-1 min-w-[150px] text-left">{t("profile.juror")}</StyledLabel>
      <StyledLabel className="w-[90px] text-right shrink-0">{t("profile.pnk_staked")}</StyledLabel>
      <div className="w-[110px] shrink-0 flex justify-end items-center">
        <WithHelpTooltip place="top" tooltipMsg={t("profile.court_staking_tooltip")}>
          <StyledLabel className="text-right">{t("profile.court")}</StyledLabel>
        </WithHelpTooltip>
      </div>
      <StyledLabel className="w-[120px] text-right shrink-0">{t("profile.date")}</StyledLabel>
    </div>
  );
};
