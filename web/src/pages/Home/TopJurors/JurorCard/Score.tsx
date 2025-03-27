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

interface IScore {
  coherenceScore: string;
}

const Score: React.FC<IScore> = ({ coherenceScore }) => {
  return (
    <Container>
      <Tooltip text={coherenceScore}>{coherenceScore}</Tooltip>
    </Container>
  );
};

export default Score;
