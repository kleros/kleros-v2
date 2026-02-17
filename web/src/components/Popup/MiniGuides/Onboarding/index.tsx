import React from "react";

import { useTranslation } from "react-i18next";
import { useToggle } from "react-use";

import Appeal from "../Appeal";
import BinaryVoting from "../BinaryVoting";
import DisputeResolver from "../DisputeResolver";
import JurorLevels from "../JurorLevels";
import PageContentsTemplate from "../PageContentsTemplate";
import RankedVoting from "../RankedVoting";
import Staking from "../Staking";

import HowItWorks from "./HowItWorks";
import PnkLogoAndTitle from "./PnkLogoAndTitle";
import WhatDoINeed from "./WhatDoINeed";

const rightPageComponents = [PnkLogoAndTitle, WhatDoINeed, HowItWorks];

interface IOnboarding {
  toggleMiniGuide: () => void;
}

const Onboarding: React.FC<IOnboarding> = ({ toggleMiniGuide }) => {
  const { t } = useTranslation();

  const leftPageContents = [
    {
      title: t("mini_guides.welcome_to_kleros"),
      paragraphs: [t("mini_guides.decentralized_arbitration"), t("mini_guides.learn_whats_new")],
      links: [],
    },
    {
      title: t("mini_guides.what_do_i_need"),
      paragraphs: [
        t("mini_guides.onboarding_juror_need"),
        t("mini_guides.onboarding_contributor_participation"),
        t("mini_guides.onboarding_case_resolution"),
      ],
      links: [],
    },
    {
      title: t("mini_guides.access_mini_guides"),
      paragraphs: [],
      links: [
        { id: "Staking", text: t("mini_guides.onboarding_link_staking") },
        { id: "Binary Voting", text: t("mini_guides.onboarding_link_binary_voting") },
        { id: "Ranked Voting", text: t("mini_guides.onboarding_link_ranked_voting") },
        { id: "Appeal", text: t("mini_guides.onboarding_link_appeal") },
        { id: "Juror Levels", text: t("mini_guides.onboarding_link_juror_levels") },
        { id: "Dispute Resolver", text: t("mini_guides.onboarding_link_dispute_resolver") },
      ],
    },
  ];
  const [isStakingMiniGuideOpen, toggleStakingMiniGuide] = useToggle(false);
  const [isBinaryVotingMiniGuideOpen, toggleBinaryVotingMiniGuide] = useToggle(false);
  const [isRankedVotingMiniGuideOpen, toggleRankedVotingMiniGuide] = useToggle(false);
  const [isAppealMiniGuideOpen, toggleAppealMiniGuide] = useToggle(false);
  const [isJurorLevelsMiniGuideOpen, toggleJurorLevelsMiniGuide] = useToggle(false);
  const [isDisputeResolverMiniGuideOpen, toggleDisputeResolverMiniGuide] = useToggle(false);

  const isAnyMiniGuideOpen =
    isStakingMiniGuideOpen ||
    isBinaryVotingMiniGuideOpen ||
    isRankedVotingMiniGuideOpen ||
    isAppealMiniGuideOpen ||
    isJurorLevelsMiniGuideOpen ||
    isDisputeResolverMiniGuideOpen;

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
    } else if (guideName === "Dispute Resolver") {
      toggleDisputeResolverMiniGuide();
    }
  };

  return (
    <>
      <PageContentsTemplate
        toggleMiniGuide={toggleMiniGuide}
        leftPageContents={leftPageContents}
        rightPageComponents={rightPageComponents}
        isOnboarding={true}
        canClose={!isAnyMiniGuideOpen}
        isVisible={!isAnyMiniGuideOpen}
        toggleSubMiniGuide={toggleSubMiniGuide}
      />

      {isStakingMiniGuideOpen && <Staking toggleMiniGuide={toggleStakingMiniGuide} />}
      {isBinaryVotingMiniGuideOpen && <BinaryVoting toggleMiniGuide={toggleBinaryVotingMiniGuide} />}
      {isRankedVotingMiniGuideOpen && <RankedVoting toggleMiniGuide={toggleRankedVotingMiniGuide} />}
      {isAppealMiniGuideOpen && <Appeal toggleMiniGuide={toggleAppealMiniGuide} />}
      {isJurorLevelsMiniGuideOpen && <JurorLevels toggleMiniGuide={toggleJurorLevelsMiniGuide} />}
      {isDisputeResolverMiniGuideOpen && <DisputeResolver toggleMiniGuide={toggleDisputeResolverMiniGuide} />}
    </>
  );
};

export default Onboarding;
