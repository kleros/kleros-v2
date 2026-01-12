import React, { useState } from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";

import { Card as _Card } from "@kleros/ui-components-library";

import { landscapeStyle } from "styles/landscapeStyle";

import Coherence from "pages/Profile/JurorInfo/Coherence";
import PixelArt from "pages/Profile/JurorInfo/PixelArt";

import Template from "./MainStructureTemplate";
import { Title, ParagraphsContainer, LeftContentContainer } from "./PageContentsTemplate";

const Card = styled(_Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 234px;
  height: 100%;
  gap: 28px;

  padding: 24px;

  ${landscapeStyle(
    () => css`
      flex-direction: row;
      width: 100%;
      height: 236px;
    `
  )}
`;

const getLeftPageContents = (t: any) => [
  {
    title: t("juror_levels.level_0_diogenes"),
    paragraphs: [t("juror_levels.coherence_score_below_25"), t("juror_levels.level_0_description")],
  },
  {
    title: t("juror_levels.level_1_pythagoras"),
    paragraphs: [t("juror_levels.coherence_score_25_49"), t("juror_levels.level_1_description")],
  },
  {
    title: t("juror_levels.level_2_socrates"),
    paragraphs: [t("juror_levels.coherence_score_50_69"), t("juror_levels.level_2_description")],
  },
  {
    title: t("juror_levels.level_3_plato"),
    paragraphs: [t("juror_levels.coherence_score_70_89"), t("juror_levels.level_3_description")],
  },
  {
    title: t("juror_levels.level_4_aristotle"),
    paragraphs: [t("juror_levels.coherence_score_90_100"), t("juror_levels.level_4_description")],
  },
];

const userLevelData = [
  {
    level: 0,
    title: "Diogenes",
    totalCoherentVotes: 2,
    totalResolvedVotes: 10,
  },
  {
    level: 1,
    title: "Pythagoras",
    totalCoherentVotes: 6,
    totalResolvedVotes: 12,
  },
  {
    level: 2,
    title: "Socrates",
    totalCoherentVotes: 22,
    totalResolvedVotes: 34,
  },
  {
    level: 3,
    title: "Plato",
    totalCoherentVotes: 52,
    totalResolvedVotes: 65,
  },
  {
    level: 4,
    title: "Aristotle",
    totalCoherentVotes: 90,
    totalResolvedVotes: 90,
  },
];

const LeftContent: React.FC<{ currentPage: number }> = ({ currentPage }) => {
  const { t } = useTranslation();
  const leftPageContents = getLeftPageContents(t);
  const { title, paragraphs } = leftPageContents[currentPage - 1];

  return (
    <LeftContentContainer>
      <Title>{title}</Title>
      <ParagraphsContainer>
        {paragraphs.map((paragraph, index) => (
          <label key={paragraph}>{paragraph}</label>
        ))}
      </ParagraphsContainer>
    </LeftContentContainer>
  );
};

const RightContent: React.FC<{ currentPage: number }> = ({ currentPage }) => {
  const userData = userLevelData[currentPage - 1];
  return (
    <Card>
      <PixelArt level={userData.level} width="189px" height="189px" />
      <Coherence
        userLevelData={userData}
        totalCoherentVotes={userData.totalCoherentVotes}
        totalResolvedVotes={userData.totalResolvedVotes}
        isMiniGuide={true}
      />
    </Card>
  );
};

interface IJurorLevels {
  toggleMiniGuide: () => void;
}

const JurorLevels: React.FC<IJurorLevels> = ({ toggleMiniGuide }) => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const leftPageContents = getLeftPageContents(t);

  return (
    <Template
      LeftContent={<LeftContent currentPage={currentPage} />}
      RightContent={<RightContent currentPage={currentPage} />}
      onClose={toggleMiniGuide}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      numPages={leftPageContents.length}
      isOnboarding={false}
      canClose={true}
      isVisible={true}
    />
  );
};

export default JurorLevels;
