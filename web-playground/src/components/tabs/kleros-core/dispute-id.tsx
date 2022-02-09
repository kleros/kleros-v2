import React from "react";
import styled from "styled-components";
import { Button } from "@kleros/ui-components-library";
import DisputeField from "../../dispute-id";

const Wrapper = styled.div`
  height: auto;
  width: 100%;
  display: flex;
  align-items: center;
`;

const StyledButtonContainer = styled.div`
  z-index: 100;
  margin-left: 32px;
  display: flex;
  gap: 32px;
`;

const DisputeID = () => (
  <Wrapper>
    <DisputeField callback={() => {}} />
    <StyledButtonContainer>
      <Button text="Pass Dispute Period" />
      <Button text="Draw Jurors" />
      <Button text="Execute Ruling" />
    </StyledButtonContainer>
  </Wrapper>
);

export default DisputeID;
