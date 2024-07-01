import React from "react";

import PageContentsTemplate from "../PageContentsTemplate";

import StartACase from "./StartACase";
import Parameters from "./Parameters";
import VotingOptions from "./VotingOptions";
import Parties from "./Parties";
import Policy from "./Policy";
import WellDone from "./WellDone";

const leftPageContents = [
  {
    title: "Start a case",
    paragraphs: [
      "First, you need to write a title, and a description for the case. Make it simple to read and understand.",
    ],
  },
  {
    title: "Parameters",
    paragraphs: [
      "Define some parameters:",
      "• Choose a court to arbitrate the case.<br/>• Select a category.<br/>• Select the number of jurors.",
      "The more jurors you select, higher the arbitration cost will be. By default we use 3 jurors for the first " +
        "round. The arbitration cost is the value used to pay the jurors for their work.",
    ],
  },
  {
    title: "Voting options",
    paragraphs: [
      "Write the question jurors will answer when voting, and the voting options. You can have 2 or more options if needed.",
    ],
  },
  {
    title: "Parties of the dispute",
    paragraphs: ["Define the parties involved in the dispute."],
  },
  {
    title: "Policy",
    paragraphs: [
      "Submit a Policy. The Policy provides jurors with a framework to vote fairly. It can be a set of " +
        "criteria, a contract stating the rights and duties of the parties, or any set of pre-defined rules " +
        "that are relevant to jurors' decision-making.",
    ],
  },
  {
    title: "Well done!",
    paragraphs: [
      "The case is ready to be created! Review the information, and submit the case. Don't forget to submit " +
        "evidence, and follow up the dispute resolution process until its conclusion.",
    ],
  },
];

const rightPageComponents = [StartACase, Parameters, VotingOptions, Parties, Policy, WellDone];

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
