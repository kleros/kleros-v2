import React from "react";
import styled from "styled-components";

import { CustomRadioItem, RadioIndicator } from "@kleros/ui-components-library";

import { Features } from "src/dispute-kits/types";

export type RadioInput = {
  value: Features;
  checked: boolean;
  disabled: boolean;
};

export type FeatureUI = React.FC<RadioInput>;

/** The label content of a feature radio: the indicator + text, with the disabled styling. */
const FeatureLabel = styled.span<{ $disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: ${({ theme, $disabled }) => ($disabled ? theme.secondaryText : theme.primaryText)};
  opacity: ${({ $disabled }) => ($disabled ? 0.7 : 1)};
`;

/** A feature row's radio: a single `CustomRadioItem` rendering the indicator + label.
 *  Selection is driven by the parent `CustomRadio` group. */
export const FeatureRadio: React.FC<RadioInput & { label: string }> = ({ value, disabled, label }) => (
  <CustomRadioItem value={value} isDisabled={disabled}>
    {(rp) => (
      <FeatureLabel $disabled={disabled}>
        <RadioIndicator {...rp} small />
        {label}
      </FeatureLabel>
    )}
  </CustomRadioItem>
);
