import React from "react";
import styled from "styled-components";

import { responsiveSize } from "styles/responsiveSize";

import { useToggle } from "react-use";

import XIcon from "svgs/socialmedia/x.svg";

import HowItWorks from "components/HowItWorks";
import JurorLevels from "components/Popup/MiniGuides/JurorLevels";
import { ExternalLink } from "components/ExternalLink";

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

interface IHeader {
  levelTitle: string;
  levelNumber: number;
  totalCoherentVotes: number;
  totalResolvedVotes: number;
}

const Header: React.FC<IHeader> = ({ levelTitle, levelNumber, totalCoherentVotes, totalResolvedVotes }) => {
  const [isJurorLevelsMiniGuideOpen, toggleJurorLevelsMiniGuide] = useToggle(false);

  const coherencePercentage = parseFloat(((totalCoherentVotes / Math.max(totalResolvedVotes, 1)) * 100).toFixed(2));
  const courtUrl = window.location.origin;
  const xPostText = `Hey I've been busy as a Juror on the Kleros court, check out my score: \n\nLevel: ${levelNumber} (${levelTitle})\nCoherence Percentage: ${coherencePercentage}%\nCoherent Votes: ${totalCoherentVotes}/${totalResolvedVotes}\n\nBe a juror with me! ➡️ ${courtUrl}`;
  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(xPostText)}`;

  return (
    <Container>
      <StyledTitle>Juror Dashboard</StyledTitle>
      <LinksContainer>
        <HowItWorks
          isMiniGuideOpen={isJurorLevelsMiniGuideOpen}
          toggleMiniGuide={toggleJurorLevelsMiniGuide}
          MiniGuideComponent={JurorLevels}
        />
        {totalResolvedVotes > 0 ? (
          <StyledLink to={xShareUrl} target="_blank" rel="noreferrer">
            <StyledXIcon /> <span>Share your juror score</span>
          </StyledLink>
        ) : null}
      </LinksContainer>
    </Container>
  );
};

export default Header;
