import React from "react";
import JurorRewards from "../Staking/JurorRewards";
import VotingModule from "./VotingModule";
import PageContentsTemplate from "../PageContentsTemplate";

const leftPageContents = [
  {
    title: "Ranked Voting",
    paragraphs: [
      "Jurors rank the options in order of preference. The number of options you rank doesn’t affect the rewards" +
        " you may win as long as you rank the winning option. Note it’s also possible to reject some options you" +
        " consider inadequate.",
      "Refuse to Arbitrate is used when a dispute has been posted in the wrong court, has no clear outcome, or" +
        " evidence is immoral and/or illegal. In case the majority decides to Refuse to Arbitrate, that option is" +
        " considered the winner.",
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

interface IRankedVoting {
  toggleMiniGuide: () => void;
}

const RankedVoting: React.FC<IRankedVoting> = ({ toggleMiniGuide }) => {
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

export default RankedVoting;
