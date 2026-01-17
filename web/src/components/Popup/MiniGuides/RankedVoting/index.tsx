import React from "react";

import { useTranslation } from "react-i18next";

import PrivateVoting from "../BinaryVoting/PrivateVoting";
import PageContentsTemplate from "../PageContentsTemplate";
import JurorRewards from "../Staking/JurorRewards";

import VotingModule from "./VotingModule";

const rightPageComponents = [VotingModule, PrivateVoting, JurorRewards];

interface IRankedVoting {
  toggleMiniGuide: () => void;
}

const RankedVoting: React.FC<IRankedVoting> = ({ toggleMiniGuide }) => {
  const { t } = useTranslation();

  const leftPageContents = [
    {
      title: t("mini_guides.ranked_voting"),
      paragraphs: [t("mini_guides.ranked_voting_description"), t("mini_guides.ranked_voting_refuse_to_arbitrate")],
    },
    {
      title: t("mini_guides.private_voting"),
      paragraphs: [
        t("mini_guides.private_voting_description"),
        t("mini_guides.private_voting_whats_different"),
        t("mini_guides.private_voting_note"),
      ],
    },
    {
      title: t("mini_guides.juror_rewards"),
      paragraphs: [t("mini_guides.ranked_voting_juror_rewards_description")],
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

export default RankedVoting;
