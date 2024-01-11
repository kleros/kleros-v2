import React from "react";
import CourtHeader from "./CourtHeader";
import JurorRewards from "./JurorRewards";
import Notifications from "./Notifications";
import StakingSection from "./StakingSection";
import PageContentsTemplate from "../PageContentsTemplate";

const leftPageContents = [
  {
    title: "Joining a court",
    paragraphs: [
      "Candidates self-select to serve as jurors by staking PNK tokens. The probability of being drawn as a juror" +
        " for a specific dispute is proportional to the amount of tokens a juror stakes." +
        " Check the ‘Juror Odds’ for an estimation of your chances to be drawn. Note that staking PNK in a court" +
        " automatically stakes in its parent courts" +
        " (Branch). You can stake in a maximum of 4 court branches.",
    ],
  },
  {
    title: "Jury selection",
    paragraphs: [
      "The final selection of jurors is done randomly. When a juror is selected to arbitrate a case part" +
        " of his stake (PNK) is locked until the case is resolved. Jurors whose vote is coherent with the final" +
        " jury decision have their locked stake released. Jurors whose vote is not coherent with the final jury" +
        " decision, lose their locked stake. The locked stake of incoherent jurors is redistributed as incentives" +
        " for the coherent jurors.",
    ],
  },
  {
    title: "Juror Rewards",
    paragraphs: [
      "Users have an economic interest in serving as jurors in Kleros: collecting the Juror Rewards in exchange" +
        " for their work. Each juror who is coherent with the final ruling receive the Juror Rewards composed of" +
        " arbitration fees (ETH) + PNK redistribution between jurors.",
    ],
  },
  {
    title: "Subscribe to Notifications",
    paragraphs: [
      "After staking your PNK to join a court, we advise you to subscribe to receive email notifications." +
        " This guarantees you will be notified when drawn to arbitrate a case and won't miss the deadlines.",
    ],
  },
];

const rightPageComponents = [CourtHeader, StakingSection, JurorRewards, Notifications];

interface IStaking {
  toggleMiniGuide: () => void;
}

const Staking: React.FC<IStaking> = ({ toggleMiniGuide }) => {
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

export default Staking;
