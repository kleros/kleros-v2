import React from "react";

import BookOpenIcon from "svgs/icons/book-open.svg";

import { BlueIconTextButtonContainer } from "./BlueIconTextButtonContainer";

interface IHowItWorks {
  isMiniGuideOpen: boolean;
  toggleMiniGuide: () => void;
  MiniGuideComponent: React.ComponentType<{ toggleMiniGuide: () => void }>;
}

const HowItWorks: React.FC<IHowItWorks> = ({ isMiniGuideOpen, toggleMiniGuide, MiniGuideComponent }) => {
  return (
    <>
      <BlueIconTextButtonContainer onClick={toggleMiniGuide}>
        <BookOpenIcon />
        How it works
      </BlueIconTextButtonContainer>
      {isMiniGuideOpen && <MiniGuideComponent toggleMiniGuide={toggleMiniGuide} />}
    </>
  );
};

export default HowItWorks;
