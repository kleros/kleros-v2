import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";

const StyledLabel = styled.label`
  display: flex;
  font-size: 12px !important;

  ${landscapeStyle(
    () =>
      css`
        font-size: 14px !important;
      `
  )}
`;

const Stake: React.FC = () => {
  return <StyledLabel>Stake</StyledLabel>;
};
export default Stake;
