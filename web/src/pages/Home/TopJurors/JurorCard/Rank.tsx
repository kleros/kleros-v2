import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";

const Container = styled.div`
  color: ${({ theme }) => theme.primaryText};

  &::before {
    content: "#";
    display: inline;
  }

  ${landscapeStyle(
    () => css`
      width: calc(16px + (24 - 16) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
      &::before {
        display: none;
      }
    `
  )}
`;

interface IRank {
  rank: number;
}

const Rank: React.FC<IRank> = ({ rank }) => {
  return <Container>{rank}</Container>;
};
export default Rank;
