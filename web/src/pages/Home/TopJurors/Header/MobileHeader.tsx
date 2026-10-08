import React from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useToggle } from "react-use";

import { decodeURIFilter } from "utils/uri";

import HowItWorks from "components/HowItWorks";
import JurorLevels from "components/Popup/MiniGuides/JurorLevels";

export const MobileHeader: React.FC = () => {
  const { t } = useTranslation();
  const [isJurorLevelsMiniGuideOpen, toggleJurorLevelsMiniGuide] = useToggle(false);
  const { filter } = useParams();
  const { id: searchValue } = decodeURIFilter(filter ?? "all");

  return (
    <div className="flex justify-between w-full bg-klerosUIComponentsLightBlue p-4 border border-solid border-klerosUIComponentsStroke [border-top-left-radius:3px] [border-top-right-radius:3px] border-b-0 flex-wrap lg:hidden lg:p-[16px_24px]">
      <label className="text-[16px]">{!searchValue ? t("juror_levels.ranking") : t("juror_levels.jurors")}</label>
      <HowItWorks
        isMiniGuideOpen={isJurorLevelsMiniGuideOpen}
        toggleMiniGuide={toggleJurorLevelsMiniGuide}
        MiniGuideComponent={JurorLevels}
      />
    </div>
  );
};
