import React from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useToggle } from "react-use";

import RankingIcon from "svgs/icons/ranking.svg";

import { cn } from "utils/cn";
import { decodeURIFilter } from "utils/uri";

import { responsiveSize } from "styles/responsiveSize";

import HowItWorks from "components/HowItWorks";
import JurorLevels from "components/Popup/MiniGuides/JurorLevels";

import Coherence from "./Coherence";
import Rewards from "./Rewards";
import Score from "./Score";

export const DesktopHeader: React.FC = () => {
  const { t } = useTranslation();
  const [isJurorLevelsMiniGuideOpen, toggleJurorLevelsMiniGuide] = useToggle(false);
  const { filter } = useParams();
  const { id: searchValue } = decodeURIFilter(filter ?? "all");
  const renderIcon = !searchValue;

  return (
    <div
      className={cn(
        "hidden w-full bg-klerosUIComponentsLightBlue border border-klerosUIComponentsStroke rounded-t-[3px] px-8 py-[18.6px] lg:grid lg:items-center",
        renderIcon
          ? "lg:grid-cols-[min-content_minmax(160px,1fr)_minmax(60px,1fr)_minmax(80px,0.8fr)_minmax(180px,1.5fr)_minmax(100px,1fr)]"
          : "lg:grid-cols-[minmax(160px,1fr)_minmax(60px,1fr)_minmax(80px,0.8fr)_minmax(180px,1.5fr)_minmax(100px,1fr)]"
      )}
      style={{ columnGap: responsiveSize(12, 24, 900) }}
    >
      {renderIcon ? <RankingIcon className="[&_path]:fill-klerosUIComponentsPrimaryText" /> : null}
      <label className="text-[16px]">{t("juror_levels.juror")}</label>
      <Score />
      <Coherence />
      <Rewards />
      <div className="flex justify-end">
        <HowItWorks
          isMiniGuideOpen={isJurorLevelsMiniGuideOpen}
          toggleMiniGuide={toggleJurorLevelsMiniGuide}
          MiniGuideComponent={JurorLevels}
        />
      </div>
    </div>
  );
};
