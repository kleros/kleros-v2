import React, { useMemo } from "react";
import styled, { css } from "styled-components";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import Identicon from "react-identicons";
import ReactMarkdown from "react-markdown";

import { Card } from "@kleros/ui-components-library";

import AttachmentIcon from "svgs/icons/attachment.svg";

import { DEFAULT_CHAIN, getChain } from "consts/chains";
import { formatDate } from "utils/date";
import { getIpfsUrl } from "utils/getIpfsUrl";
import { shortenAddress } from "utils/shortenAddress";

import { type Evidence } from "src/graphql/graphql";

import { ExternalLink } from "./ExternalLink";
import { InternalLink } from "./InternalLink";

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
  justify-content: space-between;
  padding: 12px ${responsiveSize(8, 24)};
  > * {
    flex-basis: 1;
    flex-shrink: 0;
    margin: 0;
  }
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

const LeftContent = styled.div`
  display: block;

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }

  ${landscapeStyle(
    () => css`
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 0 12px;

      & > *:not(:last-child) {
        margin-bottom: 0;
      }
    `
  )}
`;

const HoverStyle = css`
  :hover {
    text-decoration: underline;
    color: ${({ theme }) => theme.primaryBlue};
    cursor: pointer;
  }
`;

const Address = styled.p`
  ${HoverStyle}
  margin: 0;
`;

const Timestamp = styled.label`
  color: ${({ theme }) => theme.secondaryText};
  ${HoverStyle}
`;

const DesktopText = styled.span`
  display: none;
  ${landscapeStyle(
    () => css`
      display: inline;
    `
  )}
`;

const MobileText = styled.span`
  ${landscapeStyle(
    () => css`
      display: none;
    `
  )}
`;

const StyledInternalLink = styled(InternalLink)`
  display: flex;
  gap: ${responsiveSize(5, 6)};
  > svg {
    width: 16px;
    fill: ${({ theme }) => theme.primaryBlue};
  }

  :hover svg {
    transition: fill 0.1s;
    fill: ${({ theme }) => theme.secondaryBlue};
  }
`;

const FileLinkContainer = styled.div`
  margin-left: auto;
`;

const AttachedFileText: React.FC = () => (
  <>
    <DesktopText>View attached file</DesktopText>
    <MobileText>File</MobileText>
  </>
);

interface IEvidenceCard extends Pick<Evidence, "evidence" | "timestamp" | "name" | "description" | "fileURI"> {
  sender: string;
  index: number;
  transactionHash: string;
}

const EvidenceCard: React.FC<IEvidenceCard> = ({
  evidence,
  sender,
  index,
  timestamp,
  transactionHash,
  name,
  description,
  fileURI,
}) => {
  const addressExplorerLink = useMemo(() => {
    return `${getChain(DEFAULT_CHAIN)?.blockExplorers?.default.url}/address/${sender}`;
  }, [sender]);

  const transactionExplorerLink = useMemo(() => {
    return `${getChain(DEFAULT_CHAIN)?.blockExplorers?.default.url}/tx/${transactionHash}`;
  }, [transactionHash]);

  return (
    <StyledCard>
      <TextContainer>
        <Index>#{index}:</Index>
        {name && description ? (
          <>
            <h3>{name}</h3>
            <StyledReactMarkdown>{description}</StyledReactMarkdown>
          </>
        ) : (
          <p>{evidence}</p>
        )}
      </TextContainer>
      <BottomShade>
        <LeftContent>
          <AccountContainer>
            <Identicon size="24" string={sender} />
            <ExternalLink to={addressExplorerLink} rel="noopener noreferrer" target="_blank">
              <Address>{shortenAddress(sender)}</Address>
            </ExternalLink>
          </AccountContainer>
          <ExternalLink to={transactionExplorerLink} rel="noopener noreferrer" target="_blank">
            <Timestamp>{formatDate(Number(timestamp), true)}</Timestamp>
          </ExternalLink>
        </LeftContent>
        {fileURI && fileURI !== "-" ? (
          <FileLinkContainer>
            <StyledInternalLink to={`attachment/?url=${getIpfsUrl(fileURI)}`}>
              <AttachmentIcon />
              <AttachedFileText />
            </StyledInternalLink>
          </FileLinkContainer>
        ) : null}
      </BottomShade>
    </StyledCard>
  );
};

export default EvidenceCard;
