import React from "react";
import styled, { css } from "styled-components";

import { landscapeStyle } from "styles/landscapeStyle";

import { Card as _Card } from "@kleros/ui-components-library";

import ArrowIcon from "svgs/icons/arrow.svg";
import NewTabIcon from "svgs/icons/new-tab.svg";

import { formatDate } from "utils/date";
import { getTxnExplorerLink } from "utils/index";

import { StyledArrowLink } from "components/StyledArrowLink";
import CourtName from "./CourtName";
import Stake from "./Stake";

const Container = styled(_Card)<{ isCurrentStakeCard?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: auto;
  width: 100%;
  padding: 20px 16px 24px;
  border-left: 5px solid
    ${({ theme, isCurrentStakeCard }) => (isCurrentStakeCard ? theme.secondaryPurple : theme.secondaryText)};
  flex-wrap: wrap;
  gap: 16px;

  :hover {
    cursor: auto;
  }

  ${({ theme }) => (theme.name === "light" ? `box-shadow: 0px 2px 3px 0px ${theme.stroke};` : "")}

  ${landscapeStyle(
    () => css`
      padding: 21.5px 28px;
    `
  )}
`;

const LeftContent = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16px 24px;
`;

const StakeAndLinkAndDateContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16px;
`;

const StakeAndLink = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
`;

const ReStyledArrowLink = styled(StyledArrowLink)`
  font-size: 14px;

  > svg {
    height: 15px;
    width: 15px;
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
      <LeftContent>
        <CourtName {...{ name, id }} />
        <StakeAndLinkAndDateContainer>
          <StakeAndLink>
            <Stake {...{ stake }} />
            {transactionHash ? (
              <ReStyledArrowLink to={getTxnExplorerLink(transactionHash)} target="_blank" rel="noopener noreferrer">
                <NewTabIcon />
              </ReStyledArrowLink>
            ) : null}
          </StakeAndLink>
          {timestamp ? <label>{formatDate(timestamp)}</label> : null}
        </StakeAndLinkAndDateContainer>
      </LeftContent>
      <ReStyledArrowLink to={`/courts/${id?.toString()}`}>
        Open Court <ArrowIcon />
      </ReStyledArrowLink>
    </Container>
  );
};

export default CourtCard;
