import React from "react";

import { useTranslation } from "react-i18next";

import PageContentsTemplate from "../PageContentsTemplate";

import CourtHeader from "./CourtHeader";
import JurorRewards from "./JurorRewards";
import Notifications from "./Notifications";
import StakingSection from "./StakingSection";

const rightPageComponents = [CourtHeader, StakingSection, JurorRewards, Notifications];

interface IStaking {
  toggleMiniGuide: () => void;
}

const Staking: React.FC<IStaking> = ({ toggleMiniGuide }) => {
  const { t } = useTranslation();

  const leftPageContents = [
    {
      title: t("mini_guides.joining_a_court"),
      paragraphs: [t("mini_guides.staking_joining_court_description")],
    },
    {
      title: t("mini_guides.jury_selection"),
      paragraphs: [t("mini_guides.staking_jury_selection_description")],
    },
    {
      title: t("mini_guides.juror_rewards"),
      paragraphs: [t("mini_guides.staking_juror_rewards_description")],
    },
    {
      title: t("mini_guides.subscribe_to_notifications"),
      paragraphs: [t("mini_guides.staking_subscribe_description")],
    },
  ];
  return (
    <PageContentsTemplate
      toggleMiniGuide={toggleMiniGuide}
      leftPageContents={leftPageContents}
      rightPageComponents={rightPageComponents}
      isOnboarding={false}
      canClose={true}
      isVisible={true}
    />
  );
};

export default Staking;
