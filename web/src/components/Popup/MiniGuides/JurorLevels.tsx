import React, { useState } from "react";
import styled, { css } from "styled-components";

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

const leftPageContents = [
  {
    title: "Juror Level 1: Pythagoras",
    paragraphs: [
      "Jurors are classified into distinct levels according to their performance starting from Level 1.",
      "Level 1: Jurors with ≥ 1 case arbitrated with 0-70% of coherent votes.",
    ],
  },
  {
    title: "Juror Level 2: Socrates",
    paragraphs: ["Level 2: Jurors with ≥ 3 cases arbitrated with more than 70% coherent votes."],
  },
  {
    title: "Juror Level 3: Plato",
    paragraphs: ["Level 3: Jurors with ≥ 7 cases arbitrated with more than 80% of coherent votes."],
  },
  {
    title: "Juror Level 4: Aristotle",
    paragraphs: ["Level 4: Jurors with ≥ 10 cases arbitrated with more than 90% of coherent votes."],
  },
  {
    title: "Juror Level 0: Diogenes",
    paragraphs: [
      "There's a level for the low-performance/lazy jurors. Level 0: Jurors with ≥ 3 cases arbitrated" +
        " with less than 50% of coherent votes.",
    ],
  },
];

const userLevelData = [
  {
    level: 1,
    title: "Pythagoras",
    totalCoherentVotes: 6,
    totalResolvedVotes: 10,
  },
  {
    level: 2,
    title: "Socrates",
    totalCoherentVotes: 7,
    totalResolvedVotes: 10,
  },
  {
    level: 3,
    title: "Plato",
    totalCoherentVotes: 8,
    totalResolvedVotes: 10,
  },
  {
    level: 4,
    title: "Aristotle",
    totalCoherentVotes: 9,
    totalResolvedVotes: 10,
  },
  {
    level: 0,
    title: "Diogenes",
    totalCoherentVotes: 3,
    totalResolvedVotes: 10,
  },
];

const LeftContent: React.FC<{ currentPage: number }> = ({ currentPage }) => {
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
  const [currentPage, setCurrentPage] = useState(1);

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
