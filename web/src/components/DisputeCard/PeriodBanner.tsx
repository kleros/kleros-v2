import React from "react";
import styled, { Theme } from "styled-components";
import { Periods } from "consts/periods";
import { responsiveSize } from "styles/responsiveSize";

const Container = styled.div<Omit<IPeriodBanner, "id">>`
  height: ${({ isCard }) => (isCard ? "45px" : "100%")};
  width: ${({ isCard }) => (isCard ? "auto" : responsiveSize(60, 80, 900))};
  border-top-right-radius: 3px;
  border-top-left-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  .dot {
    ::before {
      content: "";
      display: inline-block;
      height: 8px;
      width: 8px;
      border-radius: 50%;
      margin-right: 8px;
    }
  }
  ${({ theme, period, isCard }) => {
    const [frontColor, backgroundColor] = getPeriodColors(period, theme);
    return `
      ${isCard ? `border-top: 5px solid ${frontColor}` : `border-left: 5px solid ${frontColor}`};
      ${isCard && `background-color: ${backgroundColor}`};
      .front-color {
        color: ${frontColor};
      }
      .dot {
        ::before {
          background-color: ${frontColor};
        }
      }
    `;
  }};
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

const getPeriodLabel = (period: Periods): string => {
  switch (period) {
    case Periods.evidence:
      return "In Progress - Submitting Evidence";
    case Periods.commit:
      return "In Progress - Committing Vote";
    case Periods.vote:
      return "In Progress - Voting";
    case Periods.appeal:
      return "Crowdfunding Appeal";
    case Periods.execution:
      return "Closed";
    default:
      return "In Progress";
  }
};

const PeriodBanner: React.FC<IPeriodBanner> = ({ id, period, isCard = true }) => (
  <Container period={period} isCard={isCard}>
    {isCard && <label className="front-color dot">{getPeriodLabel(period)}</label>}
    <label className="front-color">#{id}</label>
  </Container>
);

export default PeriodBanner;
