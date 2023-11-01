import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { formatUnits } from "viem";

const StyledLabel = styled.label`
  display: flex;
  justify-content: flex-end;
  color: ${({ theme }) => theme.primaryText};
  font-size: 16px;

  ${landscapeStyle(
    () => css`
      min-width: 107px;
    `
  )}
`;

interface ILockedStake {
  lockedStake: bigint;
}

const LockedStake: React.FC<ILockedStake> = ({ lockedStake }) => {
  const formattedLockedStake = formatUnits(lockedStake, 18);

  return <StyledLabel>{`${formattedLockedStake} PNK`}</StyledLabel>;
};
export default LockedStake;
