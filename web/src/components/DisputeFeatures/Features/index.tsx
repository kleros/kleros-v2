import React from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";

import { CustomRadioItem, RadioIndicator } from "@kleros/ui-components-library";

import { Features } from "consts/disputeFeature";

import WithHelpTooltip from "components/WithHelpTooltip";

import ArgentinaConsumerProtection from "./ArgentinaConsumerProtection";
import ClassicVote from "./ClassicVote";
import GatedErc1155 from "./GatedErc1155";
import GatedErc20 from "./GatedErc20";
import UniversityVote from "./UniversityVote";

export type RadioInput = {
  value: Features;
  checked: boolean;
  disabled: boolean;
};

export type FeatureUI = React.FC<RadioInput>;

/** The label content of a feature radio: the indicator + text, with the disabled styling. */
export const FeatureLabel = styled.span<{ $disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: ${({ theme, $disabled }) => ($disabled ? theme.secondaryText : theme.primaryText)};
  opacity: ${({ $disabled }) => ($disabled ? 0.7 : 1)};
`;

/** A feature row's radio: a single `CustomRadioItem` rendering the indicator + label.
 *  Selection is driven by the parent `CustomRadio` group, so it takes no `checked`/`onClick`. */
export const FeatureRadio: React.FC<{ value: Features; disabled: boolean; label: string }> = ({
  value,
  disabled,
  label,
}) => (
  <CustomRadioItem value={value} isDisabled={disabled}>
    {(rp) => (
      <FeatureLabel $disabled={disabled}>
        <RadioIndicator {...rp} small />
        {label}
      </FeatureLabel>
    )}
  </CustomRadioItem>
);

const ShieldedVoteComponent: React.FC<RadioInput> = ({ value, disabled }) => {
  const { t } = useTranslation();
  return (
    <WithHelpTooltip tooltipMsg={t("tooltips.shielded_voting_tooltip")} key={Features.ShieldedVote}>
      <FeatureRadio value={value} disabled={disabled} label={t("features.single_step_shutter")} />
    </WithHelpTooltip>
  );
};

const ClassicEligibilityComponent: React.FC<RadioInput> = ({ value, disabled }) => {
  const { t } = useTranslation();
  return (
    <FeatureRadio
      key={Features.ClassicEligibility}
      value={value}
      disabled={disabled}
      label={t("features.all_jurors_in_court")}
    />
  );
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
