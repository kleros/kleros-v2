import React, { useMemo } from "react";
import styled, { css } from "styled-components";

import ReactMarkdown from "react-markdown";
import { useParams } from "react-router-dom";

import { Card } from "@kleros/ui-components-library";

import AttachmentIcon from "svgs/icons/attachment.svg";

import { formatDate } from "utils/date";
import { getIpfsUrl } from "utils/getIpfsUrl";

import { type Evidence } from "src/graphql/graphql";
import { getTxnExplorerLink } from "src/utils";

import { hoverShortTransitionTiming } from "styles/commonStyles";
import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import { ExternalLink } from "./ExternalLink";
import { InternalLink } from "./InternalLink";
import JurorTitle from "pages/Home/TopJurors/JurorCard/JurorTitle";

const StyledCard = styled(Card)`
  width: 100%;
  height: auto;
`;

const TopContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 4px;
  overflow-wrap: break-word;

  > * {
    overflow-wrap: break-word;
    margin: 0;
  }
  p {
    margin: 0;
  }
  h3 {
    display: inline-block;
    margin: 0;
  }

  ${landscapeStyle(
    () => css`
      padding: 20px 24px;
    `
  )}
`;

const IndexAndName = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
`;

const Index = styled.p`
  display: inline-block;
  color: ${({ theme }) => theme.secondaryText};
`;

const ReactMarkdownWrapper = styled.div``;
const StyledReactMarkdown = styled(ReactMarkdown)`
  a {
    font-size: 16px;
  }
  code {
    color: ${({ theme }) => theme.secondaryText};
  }
  p {
    margin: 0;
  }
`;

const BottomShade = styled.div`
  background-color: ${({ theme }) => theme.lightBlue};
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  > * {
    flex-basis: 1;
    flex-shrink: 0;
    margin: 0;
  }

  ${landscapeStyle(
    () => css`
      padding: 12px 24px;
    `
  )}
`;

const BottomLeftContent = styled.div`
  display: flex;
  gap: 8px;
  flex-direction: column;

  ${landscapeStyle(
    () => css`
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

const ExternalLinkHoverStyle = css`
  :hover {
    text-decoration: underline;
    color: ${({ theme }) => theme.primaryBlue};
    cursor: pointer;
  }
  :hover {
    label {
      text-decoration: underline;
      color: ${({ theme }) => theme.primaryBlue};
      cursor: pointer;
    }
  }
`;

const StyledExternalLink = styled(ExternalLink)`
  ${ExternalLinkHoverStyle}
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
  ${hoverShortTransitionTiming}
  display: flex;
  gap: ${responsiveSize(5, 6)};
  > svg {
    width: 16px;
    fill: ${({ theme }) => theme.primaryBlue};
  }

  :hover svg {
    fill: ${({ theme }) => theme.secondaryBlue};
  }
`;

const FileLinkContainer = styled.div`
  margin-left: auto;
`;

const StyledJurorInternalLink = styled(InternalLink)`
  label {
    color: ${({ theme }) => theme.primaryText};
  }

  :hover {
    label {
      cursor: pointer;
      color: ${({ theme }) => theme.secondaryBlue};
    }
  }

  svg {
    display: none;
  }
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
  const profileLink = `/profile/1/desc/all?address=${sender}`;
  const { id } = useParams();

  const transactionExplorerLink = useMemo(() => {
    return getTxnExplorerLink(transactionHash ?? "");
  }, [transactionHash]);

  return (
    <StyledCard>
      <TopContent dir="auto">
        <IndexAndName>
          <Index>#{index}. </Index>
          <h3>{name}</h3>
        </IndexAndName>
        {name && description ? (
          <ReactMarkdownWrapper dir="auto">
            <StyledReactMarkdown>{description}</StyledReactMarkdown>
          </ReactMarkdownWrapper>
        ) : (
          <p>{evidence}</p>
        )}
      </TopContent>
      <BottomShade>
        <BottomLeftContent>
          <StyledJurorInternalLink to={profileLink}>
            <JurorTitle address={sender} />
          </StyledJurorInternalLink>
          <StyledExternalLink to={transactionExplorerLink} rel="noopener noreferrer" target="_blank">
            <label>{formatDate(Number(timestamp), true)}</label>
          </StyledExternalLink>
        </BottomLeftContent>
        {fileURI && fileURI !== "-" ? (
          <FileLinkContainer>
            <StyledInternalLink to={`/attachment/?disputeId=${id}&title=${"Evidence File"}&url=${getIpfsUrl(fileURI)}`}>
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
