import React from "react";
import styled from "styled-components";

import { formatUnits } from "viem";

import NumberDisplay from "components/NumberDisplay";

const StyledLabel = styled.label`
  display: flex;
  font-weight: 600;
  color: ${({ theme }) => theme.primaryText};
  font-size: 16px;
  align-items: center;
  gap: 4px;
`;

interface IStake {
  stake: string;
}

const Stake: React.FC<IStake> = ({ stake }) => {
  const formattedStake = formatUnits(stake, 18);

  return (
    <StyledLabel>
      <NumberDisplay value={formattedStake} unit="PNK" />
    </StyledLabel>
  );
};
export default Stake;
