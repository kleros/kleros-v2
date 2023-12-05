import React from "react";
import { useToggle } from "react-use";
import HowItWorks from "./HowItWorks";
import PnkLogoAndTitle from "./PnkLogoAndTitle";
import WhatDoINeed from "./WhatDoINeed";
import Staking from "../Staking";
import BinaryVoting from "../BinaryVoting";
import RankedVoting from "../RankedVoting";
import Appeal from "../Appeal";
import JurorLevels from "../JurorLevels";
import PageContentsTemplate from "../PageContentsTemplate";

const leftPageContents = [
  {
    title: "Welcome to Kleros Court",
    paragraphs: ["The decentralized arbitration service for the disputes of the new economy.", "Learn what’s new"],
    links: [],
  },
  {
    title: "What do I need to start?",
    paragraphs: [
      "Do you want to be a juror? If yes, you will need PNK tokens for staking on courts, and ETH for gas fees.",
      "I don't want to be a juror. Can I still participate in the Court? Yes, sure. Users can also participate as" +
        " contributors by helping fund appeal fees in exchange for rewards, or by submitting evidence." +
        " In this case, you will need ETH.",
      "I have a case that needs resolution? What do I do? It's simple. Send your case to Kleros and receive" +
        " the resolution. You will need a few minutes to fill up the details of your case, and ETH to pay for" +
        " Arbitration fees (It's used to pay jurors for their work).",
    ],
    links: [],
  },
  {
    title: "Access the Mini Guides",
    paragraphs: [],
    links: ["1. Staking", "2. Binary Voting", "3. Ranked Voting", "4. Appeal", "5. Juror Levels"],
  },
];

const rightPageComponents = [PnkLogoAndTitle, WhatDoINeed, HowItWorks];

interface IOnboarding {
  toggleMiniGuide: () => void;
}

const Onboarding: React.FC<IOnboarding> = ({ toggleMiniGuide }) => {
  const [isStakingMiniGuideOpen, toggleStakingMiniGuide] = useToggle(false);
  const [isBinaryVotingMiniGuideOpen, toggleBinaryVotingMiniGuide] = useToggle(false);
  const [isRankedVotingMiniGuideOpen, toggleRankedVotingMiniGuide] = useToggle(false);
  const [isAppealMiniGuideOpen, toggleAppealMiniGuide] = useToggle(false);
  const [isJurorLevelsMiniGuideOpen, toggleJurorLevelsMiniGuide] = useToggle(false);

  const isAnyMiniGuideOpen =
    isStakingMiniGuideOpen ||
    isBinaryVotingMiniGuideOpen ||
    isRankedVotingMiniGuideOpen ||
    isAppealMiniGuideOpen ||
    isJurorLevelsMiniGuideOpen;

  const canCloseOnboarding =
    !isStakingMiniGuideOpen &&
    !isBinaryVotingMiniGuideOpen &&
    !isRankedVotingMiniGuideOpen &&
    !isAppealMiniGuideOpen &&
    !isJurorLevelsMiniGuideOpen;

  const toggleSubMiniGuide = (guideName: string) => {
    if (guideName === "Staking") {
      toggleStakingMiniGuide();
    } else if (guideName === "Binary Voting") {
      toggleBinaryVotingMiniGuide();
    } else if (guideName === "Ranked Voting") {
      toggleRankedVotingMiniGuide();
    } else if (guideName === "Appeal") {
      toggleAppealMiniGuide();
    } else if (guideName === "Juror Levels") {
      toggleJurorLevelsMiniGuide();
    }
  };

  return (
    <>
      <PageContentsTemplate
        toggleMiniGuide={toggleMiniGuide}
        leftPageContents={leftPageContents}
        rightPageComponents={rightPageComponents}
        isOnboarding={true}
        canClose={canCloseOnboarding}
        isVisible={!isAnyMiniGuideOpen}
        toggleSubMiniGuide={toggleSubMiniGuide}
      />

      {isStakingMiniGuideOpen && <Staking toggleMiniGuide={toggleStakingMiniGuide} />}
      {isBinaryVotingMiniGuideOpen && <BinaryVoting toggleMiniGuide={toggleBinaryVotingMiniGuide} />}
      {isRankedVotingMiniGuideOpen && <RankedVoting toggleMiniGuide={toggleRankedVotingMiniGuide} />}
      {isAppealMiniGuideOpen && <Appeal toggleMiniGuide={toggleAppealMiniGuide} />}
      {isJurorLevelsMiniGuideOpen && <JurorLevels toggleMiniGuide={toggleJurorLevelsMiniGuide} />}
    </>
  );
};

export default Onboarding;
