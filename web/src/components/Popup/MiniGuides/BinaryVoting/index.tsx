import React from "react";
import PageContentsTemplate from "../PageContentsTemplate";
import JurorRewards from "../Staking/JurorRewards";
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

const rightPageComponents = [VotingModule, JurorRewards];

interface IBinaryVoting {
  toggleMiniGuide: () => void;
}

const BinaryVoting: React.FC<IBinaryVoting> = ({ toggleMiniGuide }) => {
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
