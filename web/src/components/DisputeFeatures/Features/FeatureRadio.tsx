import React from "react";

import { CustomRadioItem, RadioIndicator } from "@kleros/ui-components-library";

import { cn } from "utils/cn";

import { Features } from "src/dispute-kits/types";

export type RadioInput = {
  value: Features;
  checked: boolean;
  disabled: boolean;
};

export type FeatureUI = React.FC<RadioInput>;

/** A feature row's radio: a single `CustomRadioItem` rendering the indicator + label.
 *  Selection is driven by the parent `CustomRadio` group. */
export const FeatureRadio: React.FC<RadioInput & { label: string }> = ({ value, disabled, label }) => (
  <CustomRadioItem value={value} isDisabled={disabled}>
    {(rp) => (
      <span
        className={cn(
          "flex items-center gap-2 text-[14px]",
          disabled
            ? "text-klerosUIComponentsSecondaryText opacity-70"
            : "text-klerosUIComponentsPrimaryText opacity-100"
        )}
      >
        <RadioIndicator {...rp} small />
        {label}
      </span>
    )}
  </CustomRadioItem>
);
