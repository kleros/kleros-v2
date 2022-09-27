import React from "react";
import styled from "styled-components";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { Card } from "@kleros/ui-components-library";
import AttachmentIcon from "svgs/icons/attachment.svg";
import { useIPFSQuery } from "hooks/useIPFSQuery";
import { shortenAddress } from "utils/shortenAddress";

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
        <Jazzicon diameter={24} seed={jsNumberForAddress(sender)} />
        <p>{shortenAddress(sender)}</p>
        {data && (
          <StyledA
            href={`https://ipfs.kleros.io${data.fileURI}`}
            target="_blank"
            rel="noreferrer"
          >
            <AttachmentIcon />
          </StyledA>
        )}
      </BottomShade>
    </StyledCard>
  );
};

const StyledCard = styled(Card)`
  width: 100%;
  height: auto;
`;

const TextContainer = styled.div`
  padding: 8px;
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
  gap: 8px;
  padding: 8px;
  > * {
    flex-basis: 1;
    flex-shrink: 0;
    margin: 0;
  }
`;

const StyledA = styled.a`
  margin-left: auto;
  margin-right: 8px;
  display: flex;
  > svg {
    width: 16px;
    fill: ${({ theme }) => theme.primaryBlue};
  }
`;

export default EvidenceCard;
