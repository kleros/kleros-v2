import React, { useMemo } from "react";

import { useTranslation } from "react-i18next";

import { Periods } from "consts/periods";
import useTheme from "hooks/useTheme";
import { cn } from "utils/cn";

import { type Theme } from "styles/themes";

export interface IPeriodBanner {
  id: number;
  period: Periods;
}

export const getPeriodColors = (period: Periods, theme: Theme): [string, string] => {
  switch (period) {
    case Periods.appeal:
      return [theme.tint, theme.tintMedium];
    case Periods.execution:
      return [theme.secondaryPurple, theme.mediumPurple];
    default:
      return [theme.primaryBlue, theme.mediumBlue];
  }
};

export const getPeriodLabel = (period: Periods, verbose: boolean, t: (key: string) => string): string => {
  switch (period) {
    case Periods.evidence:
      return verbose ? t("case_status.in_progress_submitting_evidence") : t("case_status.submitting_evidence");
    case Periods.commit:
      return verbose ? t("case_status.in_progress_committing_vote") : t("case_status.committing_vote");
    case Periods.vote:
      return verbose ? t("case_status.in_progress_voting") : t("case_status.voting");
    case Periods.appeal:
      return t("case_status.crowdfunding_appeal");
    case Periods.execution:
      return t("case_status.closed");
    default:
      return t("case_status.in_progress");
  }
};

const PeriodBanner: React.FC<IPeriodBanner> = ({ id, period }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [frontColor, backgroundColor] = useMemo(() => getPeriodColors(period, theme), [theme, period]);
  return (
    <div
      className={cn(
        "flex h-[45px] shrink-0 items-center justify-between gap-2 rounded-t-[3px] border-t-[5px] border-solid",
        "px-4 lg:px-6"
      )}
      style={{ borderTopColor: frontColor, backgroundColor }}
    >
      <label
        className={cn(
          "flex items-center before:mr-2 before:inline-block before:size-2 before:shrink-0 before:rounded-full",
          "before:bg-current before:content-['']"
        )}
        style={{ color: frontColor }}
      >
        {getPeriodLabel(period, true, t)}
      </label>
      <label className="flex items-center" style={{ color: frontColor }}>
        #{id}
      </label>
    </div>
  );
};

export default PeriodBanner;
