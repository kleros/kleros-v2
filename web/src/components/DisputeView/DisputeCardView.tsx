import React from "react";
import styled from "styled-components";

import { useNavigate } from "react-router-dom";

import { Card } from "@kleros/ui-components-library";

import { Periods } from "consts/periods";

import { responsiveSize } from "styles/responsiveSize";

import { StyledCaseCardTitleSkeleton } from "components/StyledSkeleton";

import DisputeInfo from "./DisputeInfo";
import PeriodBanner from "./PeriodBanner";

const StyledCard = styled(Card)`
  width: 100%;
  height: 100%;
  max-height: 335px;
  min-height: 290px;
`;

const CardContainer = styled.div`
  height: calc(100% - 45px);
  padding: ${responsiveSize(20, 24)};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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
  const navigate = useNavigate();
  return (
    <StyledCard hover onClick={() => navigate(`/cases/${props?.disputeID?.toString()}`)}>
      <PeriodBanner id={parseInt(props?.disputeID)} period={props?.period} />
      <CardContainer>
        {isLoading ? <StyledCaseCardTitleSkeleton /> : <TruncatedTitle text={props?.title} maxLength={100} />}
        <DisputeInfo {...props} />
      </CardContainer>
    </StyledCard>
  );
};

export default DisputeCardView;
