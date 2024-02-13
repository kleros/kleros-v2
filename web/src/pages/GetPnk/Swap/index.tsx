import React from "react";
import styled from "styled-components";
import FromCard from "./Cards/FromCard";
import ToCard from "./Cards/ToCard";
import { EnsureChain } from "components/EnsureChain";
import SwapDetails from "./Cards/SwapDetails";
import { Button } from "@kleros/ui-components-library";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: fit-content;
  gap: 16px;
`;

const StyledEnsureChain = styled(EnsureChain)`
  width: 100%;
`;

const StyledButton = styled(Button)`
  width: 100%;
`;
const Swap: React.FC = () => {
  return (
    <Container>
      <FromCard />
      <ToCard />
      <StyledEnsureChain>
        <>
          <SwapDetails />
          <StyledButton text="Swap" />
        </>
      </StyledEnsureChain>
    </Container>
  );
};

export default Swap;
