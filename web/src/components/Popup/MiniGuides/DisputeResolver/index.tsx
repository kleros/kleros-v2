import React from "react";

import { useTranslation } from "react-i18next";

import PageContentsTemplate from "../PageContentsTemplate";

import Parameters from "./Parameters";
import Parties from "./Parties";
import Policy from "./Policy";
import StartACase from "./StartACase";
import VotingOptions from "./VotingOptions";
import WellDone from "./WellDone";

const rightPageComponents = [StartACase, Parameters, VotingOptions, Parties, Policy, WellDone];

interface IDisputeResolver {
  toggleMiniGuide: () => void;
}

const DisputeResolver: React.FC<IDisputeResolver> = ({ toggleMiniGuide }) => {
  const { t } = useTranslation();

  const leftPageContents = [
    {
      title: t("mini_guides.resolver_start_case"),
      paragraphs: [t("mini_guides.resolver_start_case_description")],
    },
    {
      title: t("mini_guides.resolver_parameters"),
      paragraphs: [
        t("mini_guides.resolver_parameters_intro"),
        t("mini_guides.resolver_parameters_list"),
        t("mini_guides.resolver_parameters_cost"),
      ],
    },
    {
      title: t("mini_guides.resolver_voting_options"),
      paragraphs: [t("mini_guides.resolver_voting_options_description")],
    },
    {
      title: t("mini_guides.resolver_parties"),
      paragraphs: [t("mini_guides.resolver_parties_description")],
    },
    {
      title: t("mini_guides.resolver_policy"),
      paragraphs: [t("mini_guides.resolver_policy_description")],
    },
    {
      title: t("mini_guides.resolver_well_done"),
      paragraphs: [t("mini_guides.resolver_well_done_description")],
    },
  ];

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
