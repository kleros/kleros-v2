import React from "react";

import { useTranslation } from "react-i18next";
import { useToggle } from "react-use";
import { Address } from "viem";

import XIcon from "svgs/socialmedia/x.svg";

import { ExternalLink } from "components/ExternalLink";
import HowItWorks from "components/HowItWorks";
import JurorsLeaderboardButton from "components/JurorsLeaderboardButton";
import JurorLevels from "components/Popup/MiniGuides/JurorLevels";

interface IHeader {
  levelTitle: string;
  levelNumber: number;
  totalCoherentVotes: number;
  totalResolvedVotes: number;
  searchParamAddress: Address;
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
    <div className="flex flex-row justify-between items-center flex-wrap mb-[calc(16px_+_(24_-_16)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] gap-3">
      <h1 className="mb-0 text-[calc(20px_+_(24_-_20)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]">
        {t("profile.juror_profile")}
      </h1>
      <div className="flex text-klerosUIComponentsPrimaryBlue items-center gap-[8px_calc(20px_+_(24_-_20)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] flex-wrap">
        <JurorsLeaderboardButton />
        <HowItWorks
          isMiniGuideOpen={isJurorLevelsMiniGuideOpen}
          toggleMiniGuide={toggleJurorLevelsMiniGuide}
          MiniGuideComponent={JurorLevels}
        />
        {totalResolvedVotes > 0 && !searchParamAddress ? (
          <ExternalLink to={xShareUrl} target="_blank" rel="noreferrer" className="flex gap-2">
            <XIcon className="w-[16px] h-[16px] fill-klerosUIComponentsPrimaryBlue" />{" "}
            <span>{t("profile.share_juror_score")}</span>
          </ExternalLink>
        ) : null}
      </div>
    </div>
  );
};

export default Header;
