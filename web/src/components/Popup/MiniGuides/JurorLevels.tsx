import React, { useState } from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { Card as _Card } from "@kleros/ui-components-library";
import PixelArt from "pages/Dashboard/JurorInfo/PixelArt";
import Coherency from "pages/Dashboard/JurorInfo/Coherency";
import { Title, ParagraphsContainer, LeftContentContainer } from "./PageContentsTemplate";
import Template from "./MainStructureTemplate";

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
    title: "Juror Level 1: Phytagoras",
    paragraphs: [
      "Jurors are classified into distinct levels according to their performance starting from Level 1.",
      "Level 1: Jurors with 0 cases arbitrated, OR Jurors with ≥ 1 case arbitrated with 0-70% of coherent votes.",
    ],
  },
  {
    title: "Juror Level 2: Socrates",
    paragraphs: ["Level 2: Jurors with ≥ 3 cases arbitrated with 70%-80% of coherent votes."],
  },
  {
    title: "Juror Level 3: Plato",
    paragraphs: ["Level 3: Jurors with ≥ 7 cases arbitrated with 80%-90% of coherent votes."],
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
    title: "Phytagoras",
    totalCoherent: 6,
    totalResolvedDisputes: 10,
  },
  {
    level: 2,
    title: "Socrates",
    totalCoherent: 7,
    totalResolvedDisputes: 10,
  },
  {
    level: 3,
    title: "Plato",
    totalCoherent: 8,
    totalResolvedDisputes: 10,
  },
  {
    level: 4,
    title: "Aristotle",
    totalCoherent: 9,
    totalResolvedDisputes: 10,
  },
  {
    level: 0,
    title: "Diogenes",
    totalCoherent: 3,
    totalResolvedDisputes: 10,
  },
];

const LeftContent: React.FC<{ currentPage: number }> = ({ currentPage }) => {
  const { title, paragraphs } = leftPageContents[currentPage - 1];

  return (
    <LeftContentContainer>
      <Title>{title}</Title>
      <ParagraphsContainer>
        {paragraphs.map((paragraph, index) => (
          <label key={index}>{paragraph}</label>
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
      <Coherency
        userLevelData={userData}
        totalCoherent={userData.totalCoherent}
        totalResolvedDisputes={userData.totalResolvedDisputes}
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
