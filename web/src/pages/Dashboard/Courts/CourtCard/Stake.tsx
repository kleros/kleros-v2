import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { formatUnits } from "viem";

const StyledStakeLabel = styled.label`
  display: flex;
  font-weight: 600;
  color: ${({ theme }) => theme.primaryText};
  justify-content: flex-end;

  ${landscapeStyle(
    () => css`
      width: 140px;
    `
  )}
`;

interface IStake {
  stake: bigint;
}

const Stake: React.FC<IStake> = ({ stake }) => {
  const formattedStake = formatUnits(stake, 18);

  return <StyledStakeLabel>{`${formattedStake} PNK`}</StyledStakeLabel>;
};
export default Stake;
