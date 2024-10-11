import React from "react";
import styled from "styled-components";

import CheckCircle from "svgs/icons/check-circle-outline.svg";
import Coins from "svgs/icons/pile-coins.svg";

import Label from "components/DisputeView/CardLabels/Label";

const Container = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

interface IRulingAndRewardsIndicators {
  jurorRewardsDispersed: boolean;
  ruled: boolean;
}

const RulingAndRewardsIndicators: React.FC<IRulingAndRewardsIndicators> = ({ jurorRewardsDispersed, ruled }) => (
  <Container>
    {ruled ? <Label icon={CheckCircle} text="Ruling executed" color="green" /> : null}
    {jurorRewardsDispersed ? <Label icon={Coins} text="Juror rewards distributed" color="green" /> : null}
  </Container>
);

export default RulingAndRewardsIndicators;