import React from "react";

import PageContentsTemplate from "../PageContentsTemplate";

import CrowdfundAppeal from "./CrowdfundAppeal";

const leftPageContents = [
  {
    title: "Dispute Resolver",
    paragraphs: [
      "If after the jury has reached a decision, a party is not satisfied (because she thinks the result was" +
        " unfair), she can appeal and have the dispute ruled again.",
      "Every time the case is appealed a new round starts with all the voting options available for voting" +
        " again. The results of the previous rounds are irrelevant in terms of what the final result will be.",
      "Each new appeal instance will have twice the previous number of jurors plus one.",
    ],
  },
];

const rightPageComponents = [CrowdfundAppeal];

interface IDisputeResolver {
  toggleMiniGuide: () => void;
}

const DisputeResolver: React.FC<IDisputeResolver> = ({ toggleMiniGuide }) => {
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

export default DisputeResolver;
