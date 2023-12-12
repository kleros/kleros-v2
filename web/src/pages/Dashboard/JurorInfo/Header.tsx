import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { useToggle } from "react-use";
import XIcon from "svgs/socialmedia/x.svg";
import HowItWorks from "components/HowItWorks";
import JurorLevels from "components/Popup/MiniGuides/JurorLevels";
import { responsiveSize } from "styles/responsiveSize";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-bottom: ${responsiveSize(32, 48)};
  gap: 12px;

  ${landscapeStyle(
    () => css`
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    `
  )}
`;

const StyledTitle = styled.h1`
  margin-bottom: 0;
`;

const LinksContainer = styled.div`
  display: flex;
  color: ${({ theme }) => theme.primaryBlue};
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;

  ${landscapeStyle(
    () => css`
      gap: 32px;
    `
  )}
`;

const StyledXIcon = styled(XIcon)`
  fill: ${({ theme }) => theme.primaryBlue};
  width: 16px;
  height: 16px;
`;

const StyledLink = styled.a`
  display: flex;
  border: 0px;
  align-items: center;
  gap: 8px;

  &:hover {
    text-decoration: underline;
  }
`;

interface IHeader {
  levelTitle: string;
  levelNumber: number;
  totalCoherent: number;
  totalResolvedDisputes: number;
}

const Header: React.FC<IHeader> = ({ levelTitle, levelNumber, totalCoherent, totalResolvedDisputes }) => {
  const [isJurorLevelsMiniGuideOpen, toggleJurorLevelsMiniGuide] = useToggle(false);

  const coherencePercentage = parseFloat(((totalCoherent / Math.max(totalResolvedDisputes, 1)) * 100).toFixed(2));
  const courtUrl = window.location.origin;
  const xPostText = `Hey I've been busy as a Juror on the Kleros court, check out my score: \n\nLevel: ${levelNumber} (${levelTitle})\nCoherence Percentage: ${coherencePercentage}%\nCoherent Votes: ${totalCoherent}/${totalResolvedDisputes}\n\nBe a juror with me! ➡️ ${courtUrl}`;
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
        {totalResolvedDisputes > 0 ? (
          <StyledLink href={xShareUrl} target="_blank" rel="noreferrer">
            <StyledXIcon /> <span>Share your juror score</span>
          </StyledLink>
        ) : null}
      </LinksContainer>
    </Container>
  );
};

export default Header;
