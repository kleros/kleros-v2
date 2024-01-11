import React from "react";
import styled from "styled-components";
import { Box } from "@kleros/ui-components-library";
import BalanceIcon from "svgs/icons/law-balance.svg";

const StyledBox = styled(Box)`
  width: 100%;
  height: auto;
  border-radius: 3px;
  padding: 8px 16px;
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

const PendingVotesBox: React.FC<{ current: number; total: number; court: string }> = ({ current, total, court }) => (
  <StyledBox>
    <BalanceIcon />
    <p>
      {current === total
        ? "All jurors voted"
        : `${current} vote${current === 1 ? "" : "s"} cast out of ${total} - ${court}`}
    </p>
  </StyledBox>
);

export default PendingVotesBox;
