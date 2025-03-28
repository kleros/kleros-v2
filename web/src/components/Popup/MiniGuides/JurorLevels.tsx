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
    title: "Juror Level 0: Diogenes",
    paragraphs: [
      "Coherence Score below 25.",
      "This level is for new jurors or those frequently voting incoherently. A few coherent votes can help climb out of this level quickly.",
    ],
  },
  {
    title: "Juror Level 1: Pythagoras",
    paragraphs: [
      "Coherence Score between 25 and 49.",
      "Jurors here are gaining experience and starting to build voting reliability.",
    ],
  },
  {
    title: "Juror Level 2: Socrates",
    paragraphs: [
      "Coherence Score between 50 and 69.",
      "Mid-tier performance. Jurors at this level have demonstrated reasonable consistency in coherent voting.",
    ],
  },
  {
    title: "Juror Level 3: Plato",
    paragraphs: [
      "Coherence Score between 70 and 89.",
      "Reliable jurors with a consistent track record of coherent votes. Just a few more coherent votes away from reaching the top.",
    ],
  },
  {
    title: "Juror Level 4: Aristotle",
    paragraphs: [
      "Coherence Score between 90 and 100.",
      "Top-tier jurors with excellent coherence. Trusted members of the platform.",
    ],
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
