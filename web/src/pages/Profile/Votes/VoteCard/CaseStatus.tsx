import React, { useMemo } from "react";
import styled, { css, useTheme } from "styled-components";

import { useTranslation } from "react-i18next";

import { Periods } from "consts/periods";

import { getPeriodColors } from "components/DisputeView/PeriodBanner";

interface ICaseStatus {
  period?: string;
  ruled?: boolean;
}

const StyledLabel = styled.label<{ frontColor: string; withDot?: boolean }>`
  display: flex;
  align-items: center;
  width: auto;
  color: ${({ frontColor }) => frontColor};
  ${({ withDot, frontColor }) =>
    withDot
      ? css`
          ::before {
            content: "";
            display: inline-block;
            height: 8px;
            width: 8px;
            border-radius: 50%;
            margin-right: 8px;
            background-color: ${frontColor};
            flex-shrink: 0;
          }
        `
      : null}
`;

const CaseStatus: React.FC<ICaseStatus> = ({ period, ruled }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Determine the period or use execution if ruled
  const currentPeriod = ruled ? Periods.execution : (period as Periods) || Periods.evidence;

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
    <StyledLabel frontColor={frontColor} withDot>
      {getPeriodLabel(currentPeriod)}
    </StyledLabel>
  );
};
export default CaseStatus;
