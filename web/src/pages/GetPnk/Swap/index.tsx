import React from "react";
import styled from "styled-components";
import FromCard from "./FromCard";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 112px;
  gap: 16px;
  margin-top: 35px;
`;

const Swap: React.FC = () => {
  return (
    <Container>
      <FromCard />
    </Container>
  );
};

export default Swap;
