import React from "react";
import styled, { css } from "styled-components";
import XIcon from "svgs/socialmedia/x.svg";
import HowItWorks from "pages/Home/TopJurors/Header/HowItWorks";
import { landscapeStyle } from "styles/landscapeStyle";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;

  ${landscapeStyle(
    () => css`
      flex-direction: row;
    `
  )}
`;

const StyledTitle = styled.h1`
  margin-bottom: calc(16px + (48 - 16) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
`;

const LinksContainer = styled.div`
  display: flex;
  color: ${({ theme }) => theme.primaryBlue};
  margin-bottom: calc(16px + (48 - 16) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
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
  const coherencePercentage = parseFloat(((totalCoherent / Math.max(totalResolvedDisputes, 1)) * 100).toFixed(2));
  const courtUrl = window.location.origin;
  const xPostText = `Hey I've been busy as a Juror on the Kleros court, check out my score: \n\nLevel: ${levelNumber} (${levelTitle})\nCoherence Percentage: ${coherencePercentage}%\nCoherent Votes: ${totalCoherent}/${totalResolvedDisputes}\n\nBe a juror with me! ➡️ ${courtUrl}`;
  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(xPostText)}`;

  return (
    <Container>
      <StyledTitle>Juror Dashboard</StyledTitle>
      <LinksContainer>
        <HowItWorks />
        <StyledLink href={xShareUrl} target="_blank" rel="noreferrer">
          <StyledXIcon /> <span>Share your juror score</span>
        </StyledLink>
      </LinksContainer>
    </Container>
  );
};

export default Header;
