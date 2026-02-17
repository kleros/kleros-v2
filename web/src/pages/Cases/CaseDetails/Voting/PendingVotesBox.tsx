import React from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";

import { Box } from "@kleros/ui-components-library";

import BalanceIcon from "svgs/icons/law-balance.svg";

const StyledBox = styled(Box)`
  width: 100%;
  background-color: ${({ theme }) => theme.lightBlue};
  height: auto;
  border-radius: 3px;
  padding: 16px;
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: -4px;
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

const PendingVotesBox: React.FC<{ current: number; total: number; court: string }> = ({ current, total, court }) => {
  const { t } = useTranslation();

  return (
    <StyledBox>
      <BalanceIcon />
      <StyledP>
        {current === total
          ? t("case_status.all_jurors_voted")
          : t("case_status.votes_cast_status", { current, total, court, count: current })}
      </StyledP>
    </StyledBox>
  );
};

export default PendingVotesBox;
