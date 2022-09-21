import React from "react";
import styled from "styled-components";
import { Button, Textarea } from "@kleros/ui-components-library";

const Binary = () => {
  return (
    <Container>
      <MainContainer>
        <h1> How much such Alice receive? </h1>
        <StyledTextarea
          placeholder="Jusitfy your vote..."
          message={
            "A good justification contributes to case comprehension. " +
            "Low quality justifications can be challenged."
          }
          variant="info"
        />
        <OptionsContainer>
          <Button text="Pay 250 DAI" />
          <Button text="Pay 50 DAI" />
        </OptionsContainer>
      </MainContainer>
      <RefuseToArbitrateContainer>
        <Button variant="secondary" text="Refuse to Arbitrate" />
      </RefuseToArbitrateContainer>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: auto;
`;

const MainContainer = styled.div`
  width: 100%;
  height: auto;
  padding: 24px;
`;

const StyledTextarea = styled(Textarea)`
  width: 100%;
  height: auto;
  textarea {
    height: 200px;
    border-color: ${({ theme }) => theme.stroke};
  }
  small {
    font-weight: 400;
    hyphens: auto;
  }
`;

const OptionsContainer = styled.div`
  margin-top: 24px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
`;

const RefuseToArbitrateContainer = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.lightBlue};
  padding: 32px;
  display: flex;
  justify-content: center;
`;

export default Binary;
