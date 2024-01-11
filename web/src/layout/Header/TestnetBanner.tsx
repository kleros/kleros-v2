import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";

const Container = styled.div`
  width: 100%;
  position: sticky;
  top: 0;
  background-color: ${({ theme }) => theme.tintPurple};
  color: ${({ theme }) => theme.primaryText};

  padding: 6px 2px;

  ${landscapeStyle(
    () => css`
      padding: 8px 10px;
    `
  )}
`;

const StyledP = styled.p`
  font-size: 14px;
  text-align: center;
  margin: 0;
`;

export const TestnetBanner: React.FC = () => {
  return (
    <Container>
      <StyledP>
        Thanks for trying Kleros V2! This a testnet release: work is still in progress and some features are missing.
        More info{" "}
        <a href="https://docs.kleros.io/products/court-v2" target="_blank" rel="noreferrer">
          here
        </a>
        .
      </StyledP>
    </Container>
  );
};
