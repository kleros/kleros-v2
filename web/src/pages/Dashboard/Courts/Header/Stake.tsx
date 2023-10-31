import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";

const StyledStakeLabel = styled.label`
  display: flex;

  ${landscapeStyle(() => css``)}
`;

const Stake: React.FC = () => {
  return <StyledStakeLabel> Stake </StyledStakeLabel>;
};
export default Stake;
