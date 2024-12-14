import React from "react";
import styled from "styled-components";

import { Link } from "react-router-dom";

import { Card } from "@kleros/ui-components-library";

import { Periods } from "consts/periods";

import { responsiveSize } from "styles/responsiveSize";
import { hoverShortTransitionTiming } from "styles/commonStyles";

import { StyledSkeleton } from "components/StyledSkeleton";

import DisputeInfo from "./DisputeInfo";
import PeriodBanner from "./PeriodBanner";

const StyledCard = styled(Card)`
  ${hoverShortTransitionTiming}
  width: 100%;
  height: 100%;
  max-height: 335px;
  min-height: 290px;

  &:hover {
    background-color: ${({ theme }) => theme.lightGrey}BB;
  }
`;

const CardContainer = styled.div`
  height: calc(100% - 45px);
  padding: ${responsiveSize(20, 24)};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const StyledCaseCardTitleSkeleton = styled(StyledSkeleton)`
  margin-bottom: 16px;
`;

const TruncatedTitle = ({ text, maxLength }) => {
  const truncatedText = text.length <= maxLength ? text : text.slice(0, maxLength) + "…";
  return <h3>{truncatedText}</h3>;
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
      <StyledCard>
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
