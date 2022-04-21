import React from "react";
import styled from "styled-components";
import { Card } from "@kleros/ui-components-library";
import StatDisplay from "components/StatDisplay";
import PNKIcon from "svgs/icons/pnk.svg";

const StyledCard = styled(Card)`
  width: auto;
  height: fit-content;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const Stats = () => (
  <StyledCard>
    <StatDisplay
      title="PNK staked"
      text="136,000,000"
      subtext="$ 3,000,000"
      color="purple"
      icon={<PNKIcon />}
    />
    <StatDisplay
      title="PNK staked"
      text="136,000,000"
      subtext="$ 3,000,000"
      color="blue"
      icon={<PNKIcon />}
    />
    <StatDisplay
      title="PNK staked"
      text="136,000,000"
      subtext="$ 3,000,000"
      color="green"
      icon={<PNKIcon />}
    />
  </StyledCard>
);

export default Stats;
