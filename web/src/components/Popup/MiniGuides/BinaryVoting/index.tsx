import React from "react";

import PageContentsTemplate from "../PageContentsTemplate";
import JurorRewards from "../Staking/JurorRewards";

import PrivateVoting from "./PrivateVoting";
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
    title: "Private Voting",
    paragraphs: [
      "This feature introduces the commit and reveal mechanism, enhancing the secrecy and integrity of votes.",
      "What’s different? In courts with private voting, jurors cast their votes in two parts: Firstly, they" +
        " vote on a chosen option. The vote is kept secret from other jurors. (Commit period). Finally, they reveal" +
        " their votes adding a justification (Voting Period).",
      "Note that jurors who miss the Commit period, cannot progress to the Voting period, not being able to conclude" +
        " the voting. Make sure not to miss the Commit, and the Voting periods.",
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

const rightPageComponents = [VotingModule, PrivateVoting, JurorRewards];

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
