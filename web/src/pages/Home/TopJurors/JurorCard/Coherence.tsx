import { Tooltip } from "@kleros/ui-components-library";
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

const getPercent = (num: number, den: number): string => {
  if (den === 0) return "0%";
  return `${Math.floor((num * 100) / den)}%`;
};

interface ICoherence {
  totalCoherentVotes: string;
  totalResolvedVotes: string;
}

const Coherence: React.FC<ICoherence> = ({ totalCoherentVotes, totalResolvedVotes }) => {
  const coherenceRatio = `${totalCoherentVotes}/${totalResolvedVotes}`;

  return (
    <Container>
      <Tooltip text={coherenceRatio}>{getPercent(Number(totalCoherentVotes), Number(totalResolvedVotes))}</Tooltip>
    </Container>
  );
};

export default Coherence;
