import React, { useMemo } from "react";

import { useTranslation } from "react-i18next";

import { Periods } from "consts/periods";
import { useTheme } from "hooks/useTheme";

import { Period } from "src/graphql/graphql";

import { getPeriodColors } from "components/DisputeView/PeriodBanner";

interface ICaseStatus {
  period?: Period;
  ruled?: boolean;
}

const CaseStatus: React.FC<ICaseStatus> = ({ period, ruled }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Determine the period or use execution if ruled
  const currentPeriod = ruled ? Periods.execution : period ? Periods[period] : Periods.evidence;

  const [frontColor] = useMemo(() => getPeriodColors(currentPeriod, theme), [theme, currentPeriod]);

  const getPeriodLabel = (period: Periods): string => {
    switch (period) {
      case Periods.evidence:
        return t("case_status.in_progress");
      case Periods.commit:
        return t("case_status.in_progress");
      case Periods.vote:
        return t("case_status.voting");
      case Periods.appeal:
        return t("case_status.crowdfunding_appeal");
      case Periods.execution:
        return t("case_status.closed");
      default:
        return t("case_status.in_progress");
    }
  };

  return (
    <label
      className="flex items-center w-auto before:content-[''] before:inline-block before:h-2 before:w-2 before:rounded-full before:mr-2 before:bg-current before:shrink-0"
      style={{ color: frontColor }}
    >
      {getPeriodLabel(currentPeriod)}
    </label>
  );
};
export default CaseStatus;
