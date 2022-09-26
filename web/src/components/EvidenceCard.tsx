import React from "react";
import styled from "styled-components";
import { Card } from "@kleros/ui-components-library";

const EvidenceCard: React.FC<{ evidence: string }> = ({ evidence }) => {
  return (
    <StyledCard>
      <p>{evidence}</p>
      <BottomShade>address</BottomShade>
    </StyledCard>
  );
};

const StyledCard = styled(Card)`
  width: 100%;
  height: auto;
`;

const BottomShade = styled.div`
  background-color: ${({ theme }) => theme.lightBlue};
`;

export default EvidenceCard;
