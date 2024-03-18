import React, { useMemo } from "react";
import styled, { Theme, css, useTheme } from "styled-components";

import { Periods } from "consts/periods";

import { responsiveSize } from "styles/responsiveSize";

interface IContainer {
  isCard: boolean;
  frontColor: string;
  backgroundColor: string;
}

const Container = styled.div<IContainer>`
  height: ${({ isCard }) => (isCard ? "45px" : "100%")};
  width: ${({ isCard }) => (isCard ? "auto" : responsiveSize(140, 200, 900))};
  border-top-right-radius: 3px;
  border-top-left-radius: 3px;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: space-between;
  padding: 0 ${({ isCard }) => (isCard ? "24px" : responsiveSize(8, 24, 900))};
  flex-shrink: 0;
  ${({ frontColor, backgroundColor, isCard }) => {
    return `
      ${isCard ? `border-top: 5px solid ${frontColor}` : `border-left: 5px solid ${frontColor}`};
      ${isCard && `background-color: ${backgroundColor};`};
    `;
  }};
`;

const StyledLabel = styled.label<{ frontColor: string; withDot?: boolean; isCard?: boolean }>`
  display: flex;
  align-items: center;
  width: ${({ isCard }) => (isCard ? "auto" : "min-content")};
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
export interface IPeriodBanner {
  id: number;
  period: Periods;
  isCard?: boolean;
}

const getPeriodColors = (period: Periods, theme: Theme): [string, string] => {
  switch (period) {
    case Periods.appeal:
      return [theme.tint, theme.tintMedium];
    case Periods.execution:
      return [theme.secondaryPurple, theme.mediumPurple];
    default:
      return [theme.primaryBlue, theme.mediumBlue];
  }
};

const getPeriodLabel = (period: Periods, isCard: boolean): string => {
  switch (period) {
    case Periods.evidence:
      return `${isCard ? "In Progress - " : ""}Submitting Evidence`;
    case Periods.commit:
      return `${isCard ? "In Progress - " : ""}Committing Vote`;
    case Periods.vote:
      return `${isCard ? "In Progress - " : ""}Voting`;
    case Periods.appeal:
      return "Crowdfunding Appeal";
    case Periods.execution:
      return "Closed";
    default:
      return "In Progress";
  }
};

const PeriodBanner: React.FC<IPeriodBanner> = ({ id, period, isCard = true }) => {
  const theme = useTheme();
  const [frontColor, backgroundColor] = useMemo(() => getPeriodColors(period, theme), [theme, period]);
  return (
    <Container {...{ isCard, frontColor, backgroundColor }}>
      <StyledLabel frontColor={frontColor} isCard={isCard} withDot>
        {getPeriodLabel(period, isCard)}
      </StyledLabel>
      <StyledLabel frontColor={frontColor}>#{id}</StyledLabel>
    </Container>
  );
};

export default PeriodBanner;
