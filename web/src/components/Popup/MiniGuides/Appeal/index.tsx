import React, { useState } from "react";
import styled from "styled-components";
import Template from "../Template";
import CrowdfundAppeal from "./CrowdfundAppeal";
import PayoffSimulator from "./PayoffSimulator";
import StageOne from "./StageOne";
import StageTwo from "./StageTwo";

const ParagraphsContainer = styled.div`
  display: flex;
  gap: 18px;
  flex-direction: column;
`;

const Title = styled.h1`
  margin-bottom: 0;
`;

const LeftContentContainer = styled.div`
  display: flex;
  gap: 18px;
  flex-direction: column;
`;

const leftPageContents = [
  {
    title: "Appeal",
    paragraphs: [
      "If after the jury has reached a decision, a party is not satisfied (because she thinks the result was" +
        " unfair), she can appeal and have the dispute ruled again. Each new appeal instance will have twice the" +
        " previous number of jurors plus one.",
    ],
  },
  {
    title: "Appeal: Stage 1",
    paragraphs: [
      "The jury decision is appealed when stages 1 and 2 are fully funded. In stage 1, one of the losing options" +
        " must be fully funded. If no option is fully funded in time the jury decision is maintained.",
    ],
  },
  {
    title: "Appeal: Stage 2",
    paragraphs: [
      "Now, options compete together against the option fully funded at stage 1. The sum of funds must reach 100%." +
        " If it's not fully funded in time the option fully funded at stage 1 is declared the winner of the case. ",
    ],
  },
  {
    title: "Crowdfunding Rewards",
    paragraphs: [
      "Anyone can contribute to the crowdfunding of the appeal fees. Crowdfunders can win rewards in case the option" +
        " they fund wins. See how much you can earn by funding appeals, at the payoff simulator.",
    ],
  },
];

const rightPageComponents = [
  () => <CrowdfundAppeal />,
  () => <StageOne />,
  () => <StageTwo />,
  () => <PayoffSimulator />,
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
  const RightPageComponent = rightPageComponents[currentPage - 1];

  return <RightPageComponent />;
};

interface IAppeal {
  toggleMiniGuide: () => void;
}

const Appeal: React.FC<IAppeal> = ({ toggleMiniGuide }) => {
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
    />
  );
};

export default Appeal;
