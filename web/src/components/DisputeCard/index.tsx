import React from "react";
import styled from "styled-components";
import { Card } from "@kleros/ui-components-library";
import PeriodBanner, { IPeriodBanner } from "./PeriodBanner";
import DisputeInfo, { IDisputeInfo } from "./DisputeInfo";

const StyledCard = styled(Card)`
  max-width: 380px;
  min-width: 312px;
  width: auto;
  height: 260px;
`;

const Container = styled.div`
  height: 215px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  h3 {
    margin: 0;
  }
`;

interface IDisputeCard extends IPeriodBanner, Omit<IDisputeInfo, "period"> {
  title: string;
}

const DisputeCard: React.FC<IDisputeCard> = ({
  id,
  period,
  title,
  court,
  category,
  rewards,
  date,
}) => (
  <StyledCard>
    <PeriodBanner {...{ id, period }} />
    <Container>
      <h3>{title}</h3>
      <DisputeInfo {...{ court, category, rewards, period, date }} />
    </Container>
  </StyledCard>
);

export default DisputeCard;
