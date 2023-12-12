import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import Identicon from "react-identicons";
import { Card } from "@kleros/ui-components-library";
import AttachmentIcon from "svgs/icons/attachment.svg";
import { useIPFSQuery } from "hooks/useIPFSQuery";
import { shortenAddress } from "utils/shortenAddress";
import { IPFS_GATEWAY } from "consts/index";
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

const BottomShade = styled.div`
  background-color: ${({ theme }) => theme.lightBlue};
  display: flex;
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

const MobileText = styled.span`
  ${landscapeStyle(
    () => css`
      display: none;
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
}

const EvidenceCard: React.FC<IEvidenceCard> = ({ evidence, sender, index }) => {
  const { data } = useIPFSQuery(evidence.at(0) === "/" ? evidence : undefined);
  return (
    <StyledCard>
      <TextContainer>
        <Index>#{index}:</Index>
        {data ? (
          <>
            <h3>{data.name}</h3>
            <p>{data.description}</p>
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
        {data && typeof data.fileURI !== "undefined" && (
          <StyledA href={`${IPFS_GATEWAY}${data.fileURI}`} target="_blank" rel="noreferrer">
            <AttachmentIcon />
            <AttachedFileText />
          </StyledA>
        )}
      </BottomShade>
    </StyledCard>
  );
};

export default EvidenceCard;
