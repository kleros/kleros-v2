import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";

const Container = styled.div`
  width: 100%;

  label::before {
    content: "#";
    display: inline;
  }

  ${landscapeStyle(
    () => css`
      width: calc(16px + (24 - 16) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
      label::before {
        display: none;
      }
    `
  )}
`;

interface IRank {
  rank: number;
}

const Rank: React.FC<IRank> = ({ rank }) => {
  return (
    <Container>
      <label>{rank}</label>
    </Container>
  );
};
export default Rank;
