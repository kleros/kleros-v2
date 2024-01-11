import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { formatUnits } from "viem";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
  justify-content: space-between;
  width: 100%;

  ${landscapeStyle(
    () => css`
      justify-content: flex-end;
      width: auto;
    `
  )}
`;

const StyledLabel = styled.label`
  display: flex;
  font-weight: 600;
  color: ${({ theme }) => theme.primaryText};
  font-size: 16px;
  align-items: center;
  gap: 32px;
`;

interface IStake {
  stake: string;
}

const Stake: React.FC<IStake> = ({ stake }) => {
  const formattedStake = formatUnits(stake, 18);

  return (
    <Container>
      <label>Stake</label>
      <StyledLabel>{`${formattedStake} PNK`}</StyledLabel>
    </Container>
  );
};
export default Stake;
