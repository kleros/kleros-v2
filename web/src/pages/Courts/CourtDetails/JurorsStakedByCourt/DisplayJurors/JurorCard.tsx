import React from "react";
import styled from "styled-components";

import { hoverShortTransitionTiming } from "styles/commonStyles";

import JurorLink from "components/JurorLink";

import Stake from "./Stake";

const Container = styled.div`
  ${hoverShortTransitionTiming}
  display: flex;
  justify-content: space-between;
  width: 100%;
  background-color: ${({ theme }) => theme.whiteBackground};
  border: 1px solid ${({ theme }) => theme.stroke};
  border-top: none;
  align-items: center;
  padding: 16px 20px;

  :hover {
    background-color: ${({ theme }) => theme.lightGrey}BB;
  }
`;

interface IJurorCard {
  address: string;
  effectiveStake: string;
}

const JurorCard: React.FC<IJurorCard> = ({ address, effectiveStake }) => {
  return (
    <Container>
      <JurorLink {...{ address }} smallDisplay />
      <Stake {...{ effectiveStake }} />
    </Container>
  );
};

export default JurorCard;
