import React from "react";
import styled from "styled-components";
import FromCard from "./Cards/FromCard";
import ToCard from "./Cards/ToCard";
import { isProductionDeployment } from "consts/index";
import SwapButton from "./SwapButton";
import Routes from "./Cards/Routes";
import { useAccount } from "wagmi";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: fit-content;
  gap: 16px;
`;

const Swap: React.FC = () => {
  const { isDisconnected } = useAccount();
  return (
    <Container>
      <FromCard />
      <ToCard />
      {isDisconnected ? null : <Routes />}
      <SwapButton />
    </Container>
  );
};

export default Swap;
