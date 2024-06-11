import React from "react";

import PageContentsTemplate from "../PageContentsTemplate";

import CrowdfundAppeal from "./CrowdfundAppeal";
import PayoffSimulator from "./PayoffSimulator";
import StageOne from "./StageOne";
import StageTwo from "./StageTwo";
import WhoWinsRewards from "./WhoWinsRewards";

const leftPageContents = [
  {
    title: "Appeal",
    paragraphs: [
      "If after the jury has reached a decision, a party is not satisfied (because she thinks the result was" +
        " unfair), she can appeal and have the dispute ruled again.",
      "Every time the case is appealed a new round starts with all the voting options available for voting" +
        " again. The results of the previous rounds are irrelevant in terms of what the final result will be.",
      "Each new appeal instance will have twice the previous number of jurors plus one.",
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
  {
    title: "Who wins the rewards?",
    paragraphs: [
      "After the final decision (when no more appeals are possible), anyone who contributed to the winning option" +
        " receive the crowdfunding rewards.",
      "In case the winning option was not funded by anyone, contributors to the other options are partially" +
        " reimbursed (Amount funded minus arbitration cost to pay the jurors).",
      "In case no one votes on the new round, 'Refuse to arbitrate' is the chosen option.",
    ],
  },
];

const rightPageComponents = [CrowdfundAppeal, StageOne, StageTwo, PayoffSimulator, WhoWinsRewards];

interface IAppeal {
  toggleMiniGuide: () => void;
}

const Appeal: React.FC<IAppeal> = ({ toggleMiniGuide }) => {
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

export default Appeal;
