import styled from "styled-components";
import React from "react";
import { Card } from "@kleros/ui-components-library";

const Container = styled(Card)`
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 16px 23px;
  position: relative;
`;

const StyledH1 = styled.h2`
  margin: 0px;
  text-align: center;
`;

const TextContainer = styled.p`
  color: ${({ theme }) => theme.secondaryText};
  text-align: center;
  margin: 0px;
`;

const NoRouteInfo: React.FC = () => {
  return (
    <Container>
      <StyledH1>No Routes Available</StyledH1>
      <TextContainer>
        Reasons for that could be: low liquidity, amount selected is too low, gas costs are too high or there are no
        routes for the selected combination.
      </TextContainer>
    </Container>
  );
};

export default NoRouteInfo;
