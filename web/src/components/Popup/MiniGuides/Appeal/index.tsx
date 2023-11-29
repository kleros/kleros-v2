import React from "react";
import CrowdfundAppeal from "./CrowdfundAppeal";
import PayoffSimulator from "./PayoffSimulator";
import StageOne from "./StageOne";
import StageTwo from "./StageTwo";
import PageContentsTemplate from "../PageContentsTemplate";

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

const rightPageComponents = [CrowdfundAppeal, StageOne, StageTwo, PayoffSimulator];

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
