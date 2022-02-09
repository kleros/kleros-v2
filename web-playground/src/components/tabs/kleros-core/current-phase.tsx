import React from "react";
import styled from "styled-components";
import { Button } from "@kleros/ui-components-library";
import Title from "../../title";

const Wrapper = styled.div`
  height: auto;
  width: 100%;
  display: flex;
  align-items: center;
`;

const StyledStatus = styled.p`
  width: 150px;
  font-size: 24px;
`;

const StyledTitle = styled(Title)`
  width: 200px;
`;

const CurrentPhase: React.FC = () => (
  <Wrapper>
    <StyledTitle>Current Phase:</StyledTitle>
    <StyledStatus>STAKING</StyledStatus>
    <Button text="Pass Court Phase" />
  </Wrapper>
);

export default CurrentPhase;
