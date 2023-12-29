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
      display: flex;
      align-items: center;
      justify-content: start;
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
