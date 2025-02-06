import React, { useMemo } from "react";
import styled from "styled-components";

import { responsiveSize } from "styles/responsiveSize";

import { useToggle } from "react-use";
import { useSearchParams } from "react-router-dom";
import { Copiable } from "@kleros/ui-components-library";

import XIcon from "svgs/socialmedia/x.svg";

import { DEFAULT_CHAIN, getChain } from "consts/chains";
import { shortenAddress } from "utils/shortenAddress";

import HowItWorks from "components/HowItWorks";
import JurorLevels from "components/Popup/MiniGuides/JurorLevels";
import { ExternalLink } from "components/ExternalLink";
import JurorsLeaderboardButton from "components/JurorsLeaderboardButton";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: ${responsiveSize(16, 24)};
  gap: 12px;
`;

const StyledTitle = styled.h1`
  margin-bottom: 0;
  font-size: ${responsiveSize(20, 24)};
`;

const LinksContainer = styled.div`
  display: flex;
  color: ${({ theme }) => theme.primaryBlue};
  align-items: center;
  gap: 8px ${responsiveSize(20, 24)};
  flex-wrap: wrap;
`;

const StyledXIcon = styled(XIcon)`
  width: 16px;
  height: 16px;
  fill: ${({ theme }) => theme.primaryBlue};
`;

const StyledLink = styled(ExternalLink)`
  display: flex;
  gap: 8px;
`;

const StyledExternalLink = styled(ExternalLink)`
  font-size: ${responsiveSize(18, 22)};
  margin-left: ${responsiveSize(4, 8)};
  font-weight: 600;
`;

interface IHeader {
  levelTitle: string;
  levelNumber: number;
  totalCoherentVotes: number;
  totalResolvedVotes: number;
  addressToQuery: `0x${string}`;
}

const Header: React.FC<IHeader> = ({
  levelTitle,
  levelNumber,
  totalCoherentVotes,
  totalResolvedVotes,
  addressToQuery,
}) => {
  const [isJurorLevelsMiniGuideOpen, toggleJurorLevelsMiniGuide] = useToggle(false);
  const [searchParams] = useSearchParams();

  const coherencePercentage = parseFloat(((totalCoherentVotes / Math.max(totalResolvedVotes, 1)) * 100).toFixed(2));
  const courtUrl = window.location.origin;
  const xPostText = `Hey I've been busy as a Juror on the Kleros court, check out my score: \n\nLevel: ${levelNumber} (${levelTitle})\nCoherence Percentage: ${coherencePercentage}%\nCoherent Votes: ${totalCoherentVotes}/${totalResolvedVotes}\n\nBe a juror with me! ➡️ ${courtUrl}`;
  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(xPostText)}`;
  const searchParamAddress = searchParams.get("address")?.toLowerCase();

  const addressExplorerLink = useMemo(() => {
    return `${getChain(DEFAULT_CHAIN)?.blockExplorers?.default.url}/address/${addressToQuery}`;
  }, [addressToQuery]);

  return (
    <Container>
      <StyledTitle>
        Juror Profile -
        <Copiable copiableContent={addressToQuery} info="Copy Address">
          <StyledExternalLink to={addressExplorerLink} target="_blank" rel="noopener noreferrer">
            {shortenAddress(addressToQuery)}
          </StyledExternalLink>
        </Copiable>
      </StyledTitle>
      <LinksContainer>
        <JurorsLeaderboardButton />
        <HowItWorks
          isMiniGuideOpen={isJurorLevelsMiniGuideOpen}
          toggleMiniGuide={toggleJurorLevelsMiniGuide}
          MiniGuideComponent={JurorLevels}
        />
        {totalResolvedVotes > 0 && !searchParamAddress ? (
          <StyledLink to={xShareUrl} target="_blank" rel="noreferrer">
            <StyledXIcon /> <span>Share your juror score</span>
          </StyledLink>
        ) : null}
      </LinksContainer>
    </Container>
  );
};

export default Header;
