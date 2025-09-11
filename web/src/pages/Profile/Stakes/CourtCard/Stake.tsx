import React from "react";
import styled, { css } from "styled-components";

import { formatUnits } from "viem";

import { landscapeStyle } from "styles/landscapeStyle";

import NumberDisplay from "components/NumberDisplay";

import PnkIcon from "svgs/icons/pnk.svg";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  width: 100%;
  justify-content: flex-start;
  align-items: center;

  ${landscapeStyle(
    () => css`
      width: auto;
      gap: 12px;
    `
  )}
`;

const StyledLabel = styled.label`
  display: flex;
  font-weight: 600;
  color: ${({ theme }) => theme.primaryText};
  font-size: 16px;
  align-items: center;
  gap: 4px;
`;

const StyledPnkIcon = styled(PnkIcon)`
  display: inline-block;
  width: 16px;
  height: 16px;
  fill: ${({ theme }) => theme.secondaryPurple};
`;

interface IStake {
  stake: string;
}

const Stake: React.FC<IStake> = ({ stake }) => {
  const formattedStake = formatUnits(stake, 18);

  return (
    <Container>
      <StyledPnkIcon />
      <StyledLabel>
        <NumberDisplay value={formattedStake} unit="PNK" />
      </StyledLabel>
    </Container>
  );
};
export default Stake;
