import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";

const Container = styled.div`
  width: 50%;

  label {
    &::before {
      content: "Ranking";
      visibility: visible;
    }
  }

  ${landscapeStyle(
    () =>
      css`
        width: calc(16px + (24 - 16) * (min(max(100vw, 375px), 1250px) - 375px) / 875);

        label {
          &::before {
            content: "#";
          }
        }
      `
  )}
`;

const Rank: React.FC = () => (
  <Container>
    <label></label>
  </Container>
);
export default Rank;
