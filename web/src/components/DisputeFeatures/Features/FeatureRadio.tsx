import React from "react";
import styled from "styled-components";

import { CustomRadioItem, RadioIndicator } from "@kleros/ui-components-library";

import { Features } from "src/dispute-kits/types";

export type RadioInput = {
  value: Features;
  checked: boolean;
  disabled: boolean;
  /** Called when the already-selected option is pressed again. */
  onDeselect: () => void;
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

const DeselectArea = styled.span`
  display: contents;
`;

/** A feature row's radio: a single `CustomRadioItem` rendering the indicator + label.
 *  Selection is driven by the parent `CustomRadio` group. Unlike a plain radio, pressing the
 *  selected option again deselects it, since a selected feature disables incompatible ones in
 *  the other group. */
export const FeatureRadio: React.FC<RadioInput & { label: string }> = ({
  value,
  checked,
  disabled,
  onDeselect,
  label,
}) => {
  // The library bundles its own react-aria, whose radio ignores `onPress` and selects from the
  // label's press handler in the bubble phase (stopping propagation), so this must run in the
  // capture phase. It also has to take effect *after* that handler: react-aria re-applies the
  // already-selected value, which only stays a no-op while the group is still selected.
  const deselectAfterPress = () => {
    if (!checked || disabled) return;
    setTimeout(onDeselect, 0);
  };
  return (
    <DeselectArea
      onClickCapture={deselectAfterPress}
      onKeyUpCapture={(event) => event.key === " " && deselectAfterPress()}
    >
      <CustomRadioItem value={value} isDisabled={disabled}>
        {(rp) => (
          <FeatureLabel $disabled={disabled}>
            <RadioIndicator {...rp} small />
            {label}
          </FeatureLabel>
        )}
      </CustomRadioItem>
    </DeselectArea>
  );
};
