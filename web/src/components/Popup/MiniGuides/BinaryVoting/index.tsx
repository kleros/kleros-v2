import React, { useState } from "react";
import JurorRewards from "../Staking/JurorRewards";
import Template, { Title, ParagraphsContainer, LeftContentContainer } from "../Template";
import VotingModule from "./VotingModule";

const leftPageContents = [
  {
    title: "Binary Voting",
    paragraphs: [
      "Jurors choose one option to vote. The option which receives the majority of votes is considered the winner.",
      "Refuse to Arbitrate is used when a dispute has been posted in the wrong court, has no clear outcome, or" +
        " evidence is immoral and/or illegal. In case the majority decides to Refuse to Arbitrate, that option" +
        " is considered the winner.",
    ],
  },
  {
    title: "Juror Rewards",
    paragraphs: [
      "Jurors whose vote is coherent with the final jury decision (after all the appeal instances) receive the" +
        " Juror Rewards composed of arbitration fees (ETH) + PNK redistribution between jurors. Jurors whose vote" +
        " is not coherent with the final jury decision, lose their locked PNK.",
    ],
  },
];

const rightPageComponents = [() => <VotingModule />, () => <JurorRewards />];

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

interface IBinaryVoting {
  toggleMiniGuide: () => void;
}

const BinaryVoting: React.FC<IBinaryVoting> = ({ toggleMiniGuide }) => {
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
    />
  );
};

export default BinaryVoting;
