import React from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import { useToggle } from "react-use";

import XIcon from "svgs/socialmedia/x.svg";

import { responsiveSize } from "styles/responsiveSize";

import { ExternalLink } from "components/ExternalLink";
import HowItWorks from "components/HowItWorks";
import JurorsLeaderboardButton from "components/JurorsLeaderboardButton";
import JurorLevels from "components/Popup/MiniGuides/JurorLevels";

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
  searchParamAddress: `0x${string}`;
}

const Header: React.FC<IHeader> = ({
  levelTitle,
  levelNumber,
  totalCoherentVotes,
  totalResolvedVotes,
  searchParamAddress,
}) => {
  const { t } = useTranslation();
  const [isJurorLevelsMiniGuideOpen, toggleJurorLevelsMiniGuide] = useToggle(false);
  const coherencePercentage = parseFloat(((totalCoherentVotes / Math.max(totalResolvedVotes, 1)) * 100).toFixed(2));
  const courtUrl = window.location.origin;
  const xPostText = t("profile.x_post_template", {
    level: levelNumber,
    title: levelTitle,
    percentage: coherencePercentage,
    coherent: totalCoherentVotes,
    total: totalResolvedVotes,
    url: courtUrl,
  });
  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(xPostText)}`;

  return (
    <Container>
      <StyledTitle>{t("profile.juror_profile")}</StyledTitle>
      <LinksContainer>
        <JurorsLeaderboardButton />
        <HowItWorks
          isMiniGuideOpen={isJurorLevelsMiniGuideOpen}
          toggleMiniGuide={toggleJurorLevelsMiniGuide}
          MiniGuideComponent={JurorLevels}
        />
        {totalResolvedVotes > 0 && !searchParamAddress ? (
          <StyledLink to={xShareUrl} target="_blank" rel="noreferrer">
            <StyledXIcon /> <span>{t("profile.share_juror_score")}</span>
          </StyledLink>
        ) : null}
      </LinksContainer>
    </Container>
  );
};

export default Header;
