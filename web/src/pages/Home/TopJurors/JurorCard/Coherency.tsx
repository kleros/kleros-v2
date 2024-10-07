import React from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  align-items: center;
  font-weight: 600;
  color: ${({ theme }) => theme.primaryText};
  flex-wrap: wrap;
  justify-content: center;
`;

interface ICoherency {
  totalCoherentVotes: number;
  totalResolvedVotes: number;
}

const Coherency: React.FC<ICoherency> = ({ totalCoherentVotes, totalResolvedVotes }) => {
  const coherenceRatio = `${totalCoherentVotes}/${totalResolvedVotes}`;

  return <Container>{coherenceRatio}</Container>;
};

export default Coherency;
