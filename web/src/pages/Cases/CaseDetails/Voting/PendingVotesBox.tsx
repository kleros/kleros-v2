import React from "react";
import styled from "styled-components";

import { Box } from "@kleros/ui-components-library";

import BalanceIcon from "svgs/icons/law-balance.svg";

const StyledBox = styled(Box)`
  width: 100%;
  background-color: ${({ theme }) => theme.lightBlue};
  height: auto;
  border-radius: 3px;
  padding: 16px;
  display: flex;
  gap: 8px;
  align-items: center;
  > p {
    margin: 0;
  }
  > svg {
    height: 16px;
    fill: ${({ theme }) => theme.secondaryPurple};
  }
`;

const StyledP = styled.p`
  font-weight: 400;
`;

const PendingVotesBox: React.FC<{ current: number; total: number; court: string }> = ({ current, total, court }) => (
  <StyledBox>
    <BalanceIcon />
    <StyledP>
      {current === total
        ? "All jurors voted"
        : `${current} vote${current === 1 ? "" : "s"} cast out of ${total} - ${court}`}
    </StyledP>
  </StyledBox>
);

export default PendingVotesBox;
