import React from "react";

import { useTranslation } from "react-i18next";

import BookOpenIcon from "svgs/icons/book-open.svg";

import { BlueIconTextButtonContainer } from "./BlueIconTextButtonContainer";

interface IHowItWorks {
  isMiniGuideOpen: boolean;
  toggleMiniGuide: () => void;
  MiniGuideComponent: React.ComponentType<{ toggleMiniGuide: () => void }>;
}

const HowItWorks: React.FC<IHowItWorks> = ({ isMiniGuideOpen, toggleMiniGuide, MiniGuideComponent }) => {
  const { t } = useTranslation();
  return (
    <>
      <BlueIconTextButtonContainer onClick={toggleMiniGuide}>
        <BookOpenIcon />
        <label>{t("misc.how_it_works")}</label>
      </BlueIconTextButtonContainer>
      {isMiniGuideOpen && <MiniGuideComponent toggleMiniGuide={toggleMiniGuide} />}
    </>
  );
};

export default HowItWorks;
