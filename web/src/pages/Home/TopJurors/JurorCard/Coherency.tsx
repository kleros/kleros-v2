import React from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  align-items: center;
  label {
    font-weight: 600;
    color: ${({ theme }) => theme.primaryText};
  }
  flex-wrap: wrap;
`;

interface ICoherency {
  totalCoherent: number;
  totalResolvedDisputes: number;
}

const Coherency: React.FC<ICoherency> = ({ totalCoherent, totalResolvedDisputes }) => {
  const coherenceRatio = `${totalCoherent}/${totalResolvedDisputes}`;

  return (
    <Container>
      <label>{coherenceRatio}</label>
    </Container>
  );
};
export default Coherency;
