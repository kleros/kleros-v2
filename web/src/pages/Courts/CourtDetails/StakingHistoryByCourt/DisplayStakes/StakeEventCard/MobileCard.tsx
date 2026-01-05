import React from "react";
import styled, { css } from "styled-components";

import { formatDateWithTime } from "utils/date";
import { formatPNK } from "utils/format";
import { getTxnExplorerLink } from "utils/index";

import { hoverShortTransitionTiming } from "styles/commonStyles";
import { landscapeStyle } from "styles/landscapeStyle";

import { InternalLink } from "components/InternalLink";
import JurorLink from "components/JurorLink";

const Container = styled.div`
  ${hoverShortTransitionTiming}
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: ${({ theme }) => theme.whiteBackground};
  border: 1px solid ${({ theme }) => theme.stroke};
  border-top: none;
  padding: 12px 16px;
  gap: 12px;

  ${landscapeStyle(
    () => css`
      display: none;
    `
  )}

  :hover {
    background-color: ${({ theme }) => theme.lightGrey}BB;
  }
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`;

const Label = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.secondaryText};
  font-weight: 400;
`;

const Value = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.primaryText};
  font-weight: 400;
  text-align: right;
`;

const CourtLink = styled(InternalLink)`
  font-size: 14px;
  color: ${({ theme }) => theme.primaryText};
  cursor: pointer;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
  text-align: right;
`;

const CourtText = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.primaryText};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
  text-align: right;
`;

const DateLink = styled.a`
  font-size: 14px;
  color: ${({ theme }) => theme.primaryText};
  cursor: pointer;
  text-decoration: none;
  text-align: right;

  :hover {
    text-decoration: underline;
  }
`;

interface IMobileCard {
  address: string;
  stake: string;
  timestamp: string;
  transactionHash: string;
  courtName: string;
  courtId: number;
  currentCourtId?: number;
}

const MobileCard: React.FC<IMobileCard> = ({
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
      <JurorLink address={address} />
      <Row>
        <Label>PNK Staked</Label>
        <Value>{formatPNK(BigInt(stake))}</Value>
      </Row>
      <Row>
        <Label>Court</Label>
        {isCurrentCourt ? (
          <CourtText title={courtName}>{courtName}</CourtText>
        ) : (
          <CourtLink to={`/courts/${courtId}`} title={courtName}>
            {courtName}
          </CourtLink>
        )}
      </Row>
      <Row>
        <Label>Date</Label>
        <DateLink href={getTxnExplorerLink(transactionHash)} target="_blank" rel="noopener noreferrer">
          {formatDateWithTime(timestamp)}
        </DateLink>
      </Row>
    </Container>
  );
};

export default MobileCard;
