import React, { useMemo } from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { useToggle } from "react-use";

import { Copiable } from "@kleros/ui-components-library";

import XIcon from "svgs/socialmedia/x.svg";

import { DEFAULT_CHAIN, getChain } from "consts/chains";
import { shortenAddress } from "utils/shortenAddress";

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

const StyledJurorExternalLink = styled(ExternalLink)`
  font-size: ${responsiveSize(18, 22)};
  margin-left: ${responsiveSize(4, 8)};
  font-weight: 600;
`;

const StyledShareExternalLink = styled(ExternalLink)`
  display: flex;
  gap: 6px;
`;

const StyledShareLabel = styled.label`
  margin-top: 1px;
  color: ${({ theme }) => theme.primaryBlue};
  cursor: pointer;
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
  const { t } = useTranslation();
  const [isJurorLevelsMiniGuideOpen, toggleJurorLevelsMiniGuide] = useToggle(false);
  const [searchParams] = useSearchParams();

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
  const searchParamAddress = searchParams.get("address")?.toLowerCase();

  const addressExplorerLink = useMemo(() => {
    return `${getChain(DEFAULT_CHAIN)?.blockExplorers?.default.url}/address/${addressToQuery}`;
  }, [addressToQuery]);

  return (
    <Container>
      <StyledTitle>
        {t("profile.juror_profile")} -
        <Copiable copiableContent={addressToQuery} info="Copy Address">
          <StyledJurorExternalLink to={addressExplorerLink} target="_blank" rel="noopener noreferrer">
            {shortenAddress(addressToQuery)}
          </StyledJurorExternalLink>
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
          <StyledShareExternalLink to={xShareUrl} target="_blank" rel="noreferrer">
            <StyledXIcon />
            <StyledShareLabel>{t("profile.share_juror_score")}</StyledShareLabel>
          </StyledShareExternalLink>
        ) : null}
      </LinksContainer>
    </Container>
  );
};

export default Header;
