import React from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";

import { Radio } from "@kleros/ui-components-library";

import { Features } from "consts/disputeFeature";

import WithHelpTooltip from "components/WithHelpTooltip";

import ClassicVote from "./ClassicVote";
import GatedErc1155 from "./GatedErc1155";
import GatedErc20 from "./GatedErc20";

export type RadioInput = {
  name: string;
  value: Features;
  checked: boolean;
  disabled: boolean;
  onClick: () => void;
};

export type FeatureUI = React.FC<RadioInput>;

export const StyledRadio = styled(Radio)`
  font-size: 14px;
  color: ${({ theme, disabled }) => (disabled ? theme.secondaryText : theme.primaryText)};
  opacity: ${({ disabled }) => (disabled ? "0.7" : 1)};
`;

const ShieldedVoteComponent: React.FC<RadioInput> = (props) => {
  const { t } = useTranslation();
  return (
    <WithHelpTooltip tooltipMsg={t("tooltips.shielded_voting_tooltip")} key={Features.ShieldedVote}>
      <StyledRadio label={t("features.single_step_shutter")} small {...props} />
    </WithHelpTooltip>
  );
};

const ClassicEligibilityComponent: React.FC<RadioInput> = (props) => {
  const { t } = useTranslation();
  return <StyledRadio key={Features.ClassicEligibility} label={t("features.all_jurors_in_court")} small {...props} />;
};

export const FeatureUIs: Record<Features, FeatureUI> = {
  [Features.ShieldedVote]: ShieldedVoteComponent,
  [Features.ClassicVote]: ClassicVote,
  [Features.ClassicEligibility]: ClassicEligibilityComponent,
  [Features.GatedErc20]: GatedErc20,
  [Features.GatedErc1155]: GatedErc1155,
};
