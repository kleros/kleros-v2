import React from "react";
import styled, { css } from "styled-components";

import Identicon from "react-identicons";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";

import { Card } from "@kleros/ui-components-library";

import AttachmentIcon from "svgs/icons/attachment.svg";

import { useIPFSQuery } from "hooks/useIPFSQuery";
import { formatDate } from "utils/date";
import { getIpfsUrl } from "utils/getIpfsUrl";
import { shortenAddress } from "utils/shortenAddress";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

const StyledCard = styled(Card)`
  width: 100%;
  height: auto;
`;

const TextContainer = styled.div`
  padding: ${responsiveSize(8, 24)};
  > * {
    overflow-wrap: break-word;
    margin: 0;
  }
  > h3 {
    display: inline-block;
    margin: 0px 4px;
  }
`;

const Index = styled.p`
  display: inline-block;
`;

const StyledReactMarkdown = styled(ReactMarkdown)`
  a {
    font-size: 16px;
  }
  code {
    color: ${({ theme }) => theme.secondaryText};
  }
`;

const BottomShade = styled.div`
  background-color: ${({ theme }) => theme.lightBlue};
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  padding: 12px ${responsiveSize(8, 24)};
  > * {
    flex-basis: 1;
    flex-shrink: 0;
    margin: 0;
  }
`;

const StyledA = styled.a`
  display: flex;
  margin-left: auto;
  gap: ${responsiveSize(5, 6)};
  ${landscapeStyle(
    () => css`
      > svg {
        width: 16px;
        fill: ${({ theme }) => theme.primaryBlue};
      }
    `
  )}
`;

const AccountContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;

  canvas {
    width: 24px;
    height: 24px;
  }

  > * {
    flex-basis: 1;
    flex-shrink: 0;
    margin: 0;
  }
`;

const DesktopText = styled.span`
  display: none;
  ${landscapeStyle(
    () => css`
      display: inline;
    `
  )}
`;

const Timestamp = styled.p`
  color: ${({ theme }) => theme.secondaryText};
`;

const MobileText = styled.span`
  ${landscapeStyle(
    () => css`
      display: none;
    `
  )}
`;

const StyledLink = styled(Link)`
  height: fit-content;
  display: flex;
  margin-left: auto;
  gap: ${responsiveSize(5, 6)};
  ${landscapeStyle(
    () => css`
      > svg {
        width: 16px;
        fill: ${({ theme }) => theme.primaryBlue};
      }
    `
  )}
`;

const AttachedFileText: React.FC = () => (
  <>
    <DesktopText>View attached file</DesktopText>
    <MobileText>File</MobileText>
  </>
);

interface IEvidenceCard {
  evidence: string;
  sender: string;
  index: number;
  timestamp: string;
}

const EvidenceCard: React.FC<IEvidenceCard> = ({ evidence, sender, index, timestamp }) => {
  const { data } = useIPFSQuery(evidence);

  return (
    <StyledCard>
      <TextContainer>
        <Index>#{index}:</Index>
        {data ? (
          <>
            <h3>{data.name}</h3>
            <StyledReactMarkdown>{data.description}</StyledReactMarkdown>
          </>
        ) : (
          <p>{evidence}</p>
        )}
      </TextContainer>
      <BottomShade>
        <AccountContainer>
          <Identicon size="24" string={sender} />
          <p>{shortenAddress(sender)}</p>
        </AccountContainer>
        <Timestamp>{formatDate(Number(timestamp), true)}</Timestamp>
        {data && typeof data.fileURI !== "undefined" && (
          <StyledLink to={`attachment/?url=${getIpfsUrl(data.fileURI)}`}>
            <AttachmentIcon />
            <AttachedFileText />
          </StyledLink>
        )}
      </BottomShade>
    </StyledCard>
  );
};

export default EvidenceCard;
