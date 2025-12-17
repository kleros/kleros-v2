import React, { useMemo } from "react";
import styled, { css, useTheme } from "styled-components";

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

const getPeriodLabel = (period: Periods): string => {
  switch (period) {
    case Periods.evidence:
      return "In Progress";
    case Periods.commit:
      return "In Progress";
    case Periods.vote:
      return "Voting";
    case Periods.appeal:
      return "Crowdfunding Appeal";
    case Periods.execution:
      return "Closed";
    default:
      return "In Progress";
  }
};

const CaseStatus: React.FC<ICaseStatus> = ({ period, ruled }) => {
  const theme = useTheme();

  // Determine the period or use execution if ruled
  const currentPeriod = ruled ? Periods.execution : (period as Periods) || Periods.evidence;

  const [frontColor] = useMemo(() => getPeriodColors(currentPeriod, theme), [theme, currentPeriod]);

  return (
    <StyledLabel frontColor={frontColor} withDot>
      {getPeriodLabel(currentPeriod)}
    </StyledLabel>
  );
};
export default CaseStatus;
