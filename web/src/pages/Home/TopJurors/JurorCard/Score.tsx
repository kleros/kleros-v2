import React from "react";

import styled from "styled-components";

import { Tooltip } from "@kleros/ui-components-library";

const Container = styled.div`
  display: flex;
  align-items: center;
  font-weight: 600;
  color: ${({ theme }) => theme.primaryText};
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 2px;
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
