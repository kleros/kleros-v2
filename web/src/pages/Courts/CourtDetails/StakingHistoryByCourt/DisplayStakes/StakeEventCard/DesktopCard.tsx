import React from "react";
import styled, { css } from "styled-components";

import { formatPNK } from "utils/format";
import { getTxnExplorerLink } from "utils/index";

import { hoverShortTransitionTiming } from "styles/commonStyles";
import { landscapeStyle } from "styles/landscapeStyle";

import { InternalLink } from "components/InternalLink";
import JurorLink from "components/JurorLink";

const Container = styled.div`
  ${hoverShortTransitionTiming}
  display: none;
  width: 100%;
  min-width: 100%;
  background-color: ${({ theme }) => theme.whiteBackground};
  border: 1px solid ${({ theme }) => theme.stroke};
  border-top: none;
  align-items: center;
  padding: 16px 20px;
  gap: 12px;

  ${landscapeStyle(
    () => css`
      display: flex;
    `
  )}

  :hover {
    background-color: ${({ theme }) => theme.lightGrey}BB;
  }
`;

const JurorContainer = styled.div`
  flex: 1;
  min-width: 150px;
  overflow: hidden;
`;

const StyledLabel = styled.label`
  font-size: 14px;
  color: ${({ theme }) => theme.primaryText};
  flex-shrink: 0;
`;

const StakeLabel = styled(StyledLabel)`
  width: 80px;
  text-align: right;
`;

const CourtLabelContainer = styled.div`
  width: 120px;
  text-align: right;
  flex-shrink: 0;
`;

const CourtLink = styled(InternalLink)`
  font-size: 14px;
  color: ${({ theme }) => theme.primaryText};
  cursor: pointer;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  :hover {
    color: ${({ theme }) => theme.primaryBlue};
  }
`;

const CourtText = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.primaryText};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DateLabelContainer = styled.div`
  width: 120px;
  text-align: right;
  flex-shrink: 0;
`;

const DateLink = styled.a`
  font-size: 14px;
  color: ${({ theme }) => theme.primaryText};
  cursor: pointer;
  text-decoration: none;

  :hover {
    text-decoration: underline;
  }
`;

interface IDesktopCard {
  address: string;
  stake: string;
  timestamp: string;
  transactionHash: string;
  courtName: string;
  courtId: number;
  currentCourtId?: number;
}

const formatDate = (timestamp: string): string => {
  const date = new Date(parseInt(timestamp) * 1000);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const truncateCourtName = (name: string, maxLength: number = 15): string => {
  if (name.length <= maxLength) return name;
  return name.slice(0, maxLength - 3) + "...";
};

const DesktopCard: React.FC<IDesktopCard> = ({
  address,
  stake,
  timestamp,
  transactionHash,
  courtName,
  courtId,
  currentCourtId,
}) => {
  const isCurrentCourt = currentCourtId === courtId;

  return (
    <Container>
      <JurorContainer>
        <JurorLink address={address} smallDisplay />
      </JurorContainer>
      <StakeLabel>{formatPNK(BigInt(stake))}</StakeLabel>
      <CourtLabelContainer>
        {isCurrentCourt ? (
          <CourtText title={courtName}>{truncateCourtName(courtName)}</CourtText>
        ) : (
          <CourtLink to={`/courts/${courtId}`} title={courtName}>
            {truncateCourtName(courtName)}
          </CourtLink>
        )}
      </CourtLabelContainer>
      <DateLabelContainer>
        <DateLink href={getTxnExplorerLink(transactionHash)} target="_blank" rel="noopener noreferrer">
          {formatDate(timestamp)}
        </DateLink>
      </DateLabelContainer>
    </Container>
  );
};

export default DesktopCard;
