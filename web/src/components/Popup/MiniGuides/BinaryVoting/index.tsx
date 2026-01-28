import React from "react";

import { useTranslation } from "react-i18next";

import PageContentsTemplate from "../PageContentsTemplate";
import JurorRewards from "../Staking/JurorRewards";

import PrivateVoting from "./PrivateVoting";
import VotingModule from "./VotingModule";

const rightPageComponents = [VotingModule, PrivateVoting, JurorRewards];

interface IBinaryVoting {
  toggleMiniGuide: () => void;
}

const BinaryVoting: React.FC<IBinaryVoting> = ({ toggleMiniGuide }) => {
  const { t } = useTranslation();

  const leftPageContents = [
    {
      title: t("mini_guides.binary_voting"),
      paragraphs: [
        t("mini_guides.binary_voting_description_part1"),
        t("mini_guides.binary_voting_refuse_to_arbitrate"),
      ],
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
      paragraphs: [t("mini_guides.binary_voting_juror_rewards_description")],
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

export default BinaryVoting;
