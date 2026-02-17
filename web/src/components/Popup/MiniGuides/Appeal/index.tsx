import React from "react";

import { useTranslation } from "react-i18next";

import PageContentsTemplate from "../PageContentsTemplate";

import CrowdfundAppeal from "./CrowdfundAppeal";
import PayoffSimulator from "./PayoffSimulator";
import StageOne from "./StageOne";
import StageTwo from "./StageTwo";
import WhoWinsRewards from "./WhoWinsRewards";

const getLeftPageContents = (t: any) => [
  {
    title: t("appeal.appeal"),
    paragraphs: [t("appeal.appeal_paragraph_1"), t("appeal.appeal_paragraph_2"), t("appeal.appeal_paragraph_3")],
  },
  {
    title: t("appeal.appeal_stage_1"),
    paragraphs: [t("appeal.stage_1_paragraph")],
  },
  {
    title: t("appeal.appeal_stage_2"),
    paragraphs: [t("appeal.stage_2_paragraph")],
  },
  {
    title: t("appeal.crowdfunding_rewards"),
    paragraphs: [t("appeal.crowdfunding_paragraph")],
  },
  {
    title: t("appeal.who_wins_rewards"),
    paragraphs: [t("appeal.who_wins_paragraph_1"), t("appeal.who_wins_paragraph_2"), t("appeal.who_wins_paragraph_3")],
  },
];

const rightPageComponents = [CrowdfundAppeal, StageOne, StageTwo, PayoffSimulator, WhoWinsRewards];

interface IAppeal {
  toggleMiniGuide: () => void;
}

const Appeal: React.FC<IAppeal> = ({ toggleMiniGuide }) => {
  const { t } = useTranslation();
  const leftPageContents = getLeftPageContents(t);

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

export default Appeal;
