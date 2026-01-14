import React from "react";
import styled, { css } from "styled-components";

import { Card as _Card } from "@kleros/ui-components-library";

import NewTabIcon from "svgs/icons/new-tab.svg";

import { formatDate } from "utils/date";
import { getTxnExplorerLink } from "utils/index";

import { landscapeStyle } from "styles/landscapeStyle";

import { StyledArrowLink } from "components/StyledArrowLink";

import CourtName from "./CourtName";
import Stake from "./Stake";

const Container = styled(_Card)<{ isCurrentStakeCard?: boolean }>`
  display: flex;
  flex-direction: column;
  height: auto;
  width: 100%;
  padding: 20px 16px 24px;
  border-left: 5px solid
    ${({ theme, isCurrentStakeCard }) => (isCurrentStakeCard ? theme.secondaryPurple : theme.secondaryText)};
  gap: 16px;

  :hover {
    cursor: auto;
  }

  ${({ theme }) => (theme.name === "light" ? `box-shadow: 0px 2px 3px 0px ${theme.stroke};` : "")}

  ${landscapeStyle(
    () => css`
      display: grid;
      grid-template-columns: 160px 120px auto;
      align-items: center;
      padding: 21.5px 28px;
      gap: 20px;
    `
  )}
`;

const StakeAndLink = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;

  ${landscapeStyle(
    () => css`
      justify-content: flex-end;
    `
  )}
`;

const DateLabel = styled.label``;

const StyledLink = styled(StyledArrowLink)`
  width: fit-content;

  > svg {
    height: 14px;
    width: 14px;
  }
`;

interface ICourtCard {
  name: string;
  stake: string;
  id: string;
  timestamp?: number;
  transactionHash?: string;
  isCurrentStakeCard?: boolean;
}

const CourtCard: React.FC<ICourtCard> = ({
  name,
  stake,
  id,
  timestamp,
  transactionHash,
  isCurrentStakeCard = true,
}) => {
  return (
    <Container hover {...{ isCurrentStakeCard }}>
      <CourtName {...{ name, id }} />
      <Stake {...{ stake }} />
      <StakeAndLink>
        {timestamp ? <DateLabel>{formatDate(timestamp)}</DateLabel> : null}
        {transactionHash ? (
          <StyledLink to={getTxnExplorerLink(transactionHash)} target="_blank" rel="noopener noreferrer">
            <NewTabIcon />
          </StyledLink>
        ) : null}
      </StakeAndLink>
    </Container>
  );
};

export default CourtCard;
