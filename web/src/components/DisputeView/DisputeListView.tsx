import React from "react";
import styled from "styled-components";

import { Link } from "react-router-dom";
import { useAccount } from "wagmi";

import { Card } from "@kleros/ui-components-library";

import { Periods } from "consts/periods";

import { responsiveSize } from "styles/responsiveSize";

import DisputeInfo from "./DisputeInfo";
import PeriodBanner from "./PeriodBanner";

const StyledListItem = styled(Card)`
  display: flex;
  flex-grow: 1;
  width: 100%;
  height: 82px;
`;
const ListContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-grow: 1;
`;

const TitleContainer = styled.div<{ isLabel?: boolean }>`
  display: flex;
  height: 100%;
  justify-content: start;
  align-items: center;
  width: ${({ isLabel }) => (isLabel ? responsiveSize(150, 340, 900) : "fit-content")};
  h3 {
    margin: 0;
  }
`;
const TruncatedTitle = ({ text, maxLength }) => {
  const truncatedText = text.length <= maxLength ? text : text.slice(0, maxLength) + "…";
  return <h3>{truncatedText}</h3>;
};
interface IDisputeListView {
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
}
const DisputeListView: React.FC<IDisputeListView> = (props) => {
  const { isDisconnected } = useAccount();
  return (
    <Link to={`/cases/${props?.disputeID?.toString()}`}>
      <StyledListItem hover>
        <PeriodBanner isCard={false} id={parseInt(props?.disputeID ?? "0")} period={props.period} />
        <ListContainer>
          <TitleContainer isLabel={!isDisconnected}>
            <TruncatedTitle text={props?.title} maxLength={50} />
          </TitleContainer>
          <DisputeInfo {...props} />
        </ListContainer>
      </StyledListItem>
    </Link>
  );
};

export default DisputeListView;
