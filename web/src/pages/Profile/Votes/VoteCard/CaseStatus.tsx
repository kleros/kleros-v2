import React, { useMemo } from "react";
import styled, { css, useTheme } from "styled-components";

import { Periods } from "consts/periods";

import { getPeriodColors } from "components/DisputeView/PeriodBanner";

interface ICaseStatus {}

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

const CaseStatus: React.FC<ICaseStatus> = ({}) => {
  const theme = useTheme();
  const [frontColor, backgroundColor] = useMemo(
    () => getPeriodColors(Periods.evidence, theme),
    [theme, Periods.evidence]
  );

  return (
    <StyledLabel frontColor={frontColor} withDot>
      {getPeriodLabel(Periods.evidence)}
    </StyledLabel>
  );
};
export default CaseStatus;
