import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";

const Container = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;

  label {
    font-weight: 400;
    font-size: 14px;
    line-height: 19px;
    color: ${({ theme }) => theme.secondaryText} !important;
  }

  ${landscapeStyle(
    () =>
      css`
        width: calc(40px + (220 - 40) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
        gap: 36px;
      `
  )}
`;

const JurorTitle: React.FC = () => (
  <Container>
    <label>Juror</label>
  </Container>
);
export default JurorTitle;
