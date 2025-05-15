import React from "react";

import styled from "styled-components";
import { Tooltip } from "@kleros/ui-components-library";

import { getCoherencePercent } from "utils/getCoherencePercent";

const Container = styled.div`
  display: flex;
  align-items: center;
  font-weight: 600;
  color: ${({ theme }) => theme.primaryText};
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 2px;
`;

interface ICoherence {
  totalCoherentVotes: string;
  totalResolvedVotes: string;
}

const Coherence: React.FC<ICoherence> = ({ totalCoherentVotes, totalResolvedVotes }) => {
  const coherenceRatio = `${totalCoherentVotes}/${totalResolvedVotes}`;

  return (
    <Container>
      <Tooltip text={getCoherencePercent(Number(totalCoherentVotes), Number(totalResolvedVotes))}>
        {coherenceRatio}
      </Tooltip>
    </Container>
  );
};

export default Coherence;
