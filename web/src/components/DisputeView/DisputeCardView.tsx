import React from "react";
import styled, { css } from "styled-components";

import { Link } from "react-router-dom";

import { Card } from "@kleros/ui-components-library";

import { Periods } from "consts/periods";

import { hoverShortTransitionTiming } from "styles/commonStyles";
import { landscapeStyle } from "styles/landscapeStyle";

import { StyledSkeleton } from "components/StyledSkeleton";

import DisputeInfo from "./DisputeInfo";
import PeriodBanner from "./PeriodBanner";

const StyledCard = styled(Card)`
  ${hoverShortTransitionTiming}
  width: 100%;
  height: 100%;
  min-height: 290px;
`;

const CardContainer = styled.div`
  height: calc(100% - 45px);
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  ${landscapeStyle(
    () => css`
      padding: 20px 24px;
    `
  )}
`;

const StyledCaseCardTitle = styled.h3`
  margin-bottom: 20px;
`;

const StyledCaseCardTitleSkeleton = styled(StyledSkeleton)`
  margin-bottom: 20px;
`;

const TruncatedTitle = ({ text, maxLength }) => {
  const truncatedText = text.length <= maxLength ? text : text.slice(0, maxLength) + "…";
  return <StyledCaseCardTitle>{truncatedText}</StyledCaseCardTitle>;
};

interface IDisputeCardView {
  title: string;
  disputeID?: string;
  courtId?: string;
  court?: string;
  category?: string;
  rewards?: string;
  period?: Periods;
  date?: number;
  round?: number;
  overrideIsList?: boolean;
  isOverview?: boolean;
  showLabels?: boolean;
  isLoading?: boolean;
}

const DisputeCardView: React.FC<IDisputeCardView> = ({ isLoading, ...props }) => {
  return (
    <Link to={`/cases/${props?.disputeID?.toString()}`}>
      <StyledCard hover>
        <PeriodBanner id={parseInt(props?.disputeID)} period={props?.period} />
        <CardContainer>
          {isLoading ? <StyledCaseCardTitleSkeleton /> : <TruncatedTitle text={props?.title} maxLength={100} />}
          <DisputeInfo {...props} />
        </CardContainer>
      </StyledCard>
    </Link>
  );
};

export default DisputeCardView;
