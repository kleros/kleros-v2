import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { formatUnits } from "viem";

const StyledLabel = styled.label`
  display: flex;
  font-weight: 600;
  color: ${({ theme }) => theme.primaryText};
  font-size: 16px;

  ${landscapeStyle(
    () => css`
      width: 140px;
      justify-content: flex-end;
    `
  )}
`;

interface IStake {
  stake: bigint;
}

const Stake: React.FC<IStake> = ({ stake }) => {
  const formattedStake = formatUnits(stake, 18);

  return <StyledLabel>{`${formattedStake} PNK`}</StyledLabel>;
};
export default Stake;
