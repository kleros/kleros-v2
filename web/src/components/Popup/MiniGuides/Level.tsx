import React, { useState } from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { Card as _Card } from "@kleros/ui-components-library";
import PixelArt from "pages/Dashboard/JurorInfo/PixelArt";
import Coherency from "pages/Dashboard/JurorInfo/Coherency";
import Template from "./Template";

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

const Title = styled.h1`
  margin-bottom: 0;
`;

const LeftContentContainer = styled.div`
  display: flex;
  gap: 18px;
  flex-direction: column;
`;

const userLevelData = [
  {
    level: 1,
    title: "Pythagoras",
    totalCoherent: 6,
    totalResolvedDisputes: 10,
    firstParagraph: "Jurors are classified into distinct levels according to their performance starting from Level 1.",
    secondParagraph:
      "Level 1: Jurors with 0 cases arbitrated, OR Jurors with ≥ 1 case arbitrated with 0-70% of coherent votes.",
  },
  {
    level: 2,
    title: "Socrates",
    totalCoherent: 7,
    totalResolvedDisputes: 10,
    firstParagraph: "Level 2: Jurors with ≥ 3 cases arbitrated with 70%-80% of coherent votes.",
  },
  {
    level: 3,
    title: "Plato",
    totalCoherent: 8,
    totalResolvedDisputes: 10,
    firstParagraph: "Level 3: Jurors with ≥ 7 cases arbitrated with 80%-90% of coherent votes.",
  },
  {
    level: 4,
    title: "Aristoteles",
    totalCoherent: 9,
    totalResolvedDisputes: 10,
    firstParagraph: "Level 4: Jurors with ≥ 10 cases arbitrated with more than 90% of coherent votes.",
  },
  {
    level: 0,
    title: "Diogenes",
    totalCoherent: 3,
    totalResolvedDisputes: 10,
    firstParagraph:
      "There's a level for the low-performance/lazy jurors. Level 0: Jurors with ≥ 3 cases arbitrated" +
      " with less than 50% of coherent votes.",
  },
];

const LeftContent: React.FC<{ currentPage: number }> = ({ currentPage }) => {
  const userData = userLevelData[currentPage - 1];
  return (
    <LeftContentContainer>
      <Title>
        Juror Level {userData.level}: {userData.title}
      </Title>
      <label>{userData.firstParagraph}</label>
      {userData.secondParagraph ? <label>{userData.secondParagraph}</label> : null}
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

interface ILevel {
  toggleMiniGuide: () => void;
}

const Level: React.FC<ILevel> = ({ toggleMiniGuide }) => {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <Template
      LeftContent={<LeftContent currentPage={currentPage} />}
      RightContent={<RightContent currentPage={currentPage} />}
      onClose={toggleMiniGuide}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      numPages={userLevelData.length}
      isOnboarding={false}
    />
  );
};

export default Level;
