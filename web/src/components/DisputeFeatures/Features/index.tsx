import React from "react";

import { useTranslation } from "react-i18next";

import { Features } from "src/dispute-kits/types";

import WithHelpTooltip from "components/WithHelpTooltip";

import ArgentinaConsumerProtection from "./ArgentinaConsumerProtection";
import ClassicVote from "./ClassicVote";
import { FeatureRadio, type FeatureUI, type RadioInput } from "./FeatureRadio";
import GatedErc1155 from "./GatedErc1155";
import GatedErc20 from "./GatedErc20";
import UniversityVote from "./UniversityVote";

const ShieldedVoteComponent: React.FC<RadioInput> = (props) => {
  const { t } = useTranslation();
  return (
    <WithHelpTooltip tooltipMsg={t("tooltips.shielded_voting_tooltip")} key={Features.ShieldedVote}>
      <FeatureRadio {...props} label={t("features.single_step_shutter")} />
    </WithHelpTooltip>
  );
};

const ClassicEligibilityComponent: React.FC<RadioInput> = (props) => {
  const { t } = useTranslation();
  return <FeatureRadio {...props} label={t("features.all_jurors_in_court")} />;
};

export const FeatureUIs: Record<Features, FeatureUI> = {
  [Features.ShieldedVote]: ShieldedVoteComponent,
  [Features.ClassicVote]: ClassicVote,
  [Features.UniversityVote]: UniversityVote,
  [Features.ClassicEligibility]: ClassicEligibilityComponent,
  [Features.GatedErc20]: GatedErc20,
  [Features.GatedErc1155]: GatedErc1155,
  [Features.ArgentinaConsumerProtection]: ArgentinaConsumerProtection,
};
