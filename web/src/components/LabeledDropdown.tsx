import React, { useId } from "react";

import { DropdownCascader, DropdownSelect } from "@kleros/ui-components-library";

/**
 * TODO(ui-components-library): delete these wrappers and pass `aria-label` directly once
 * kleros/ui-components-library#96 ships.
 *
 * Accessible wrappers around the library's DropdownSelect / DropdownCascader.
 * 3.9.0 hardcodes `aria-label="Select"` after the prop spread, silently dropping caller-supplied
 * `aria-label`. Workaround: pass `aria-labelledby` (which the spread does forward) pointing to a
 * visually-hidden span; per ARIA, labelledby wins.
 */

// Clip technique keeps the node in the accessibility tree (display: none would remove it).

// display: contents so the wrapper doesn't break a parent flex/grid layout.

type SelectProps = React.ComponentProps<typeof DropdownSelect>;
type CascaderProps = React.ComponentProps<typeof DropdownCascader>;

type WithAriaLabel<T> = Omit<T, "aria-label" | "aria-labelledby"> & { ariaLabel: string };

export const LabeledDropdownSelect: React.FC<WithAriaLabel<SelectProps>> = ({ ariaLabel, ...props }) => {
  const id = useId();
  return (
    <div className="contents">
      <span
        id={id}
        className="absolute w-[1px] h-[1px] p-0 -m-0.25 overflow-hidden [clip:rect(0,_0,_0,_0)] whitespace-nowrap border-0"
      >
        {ariaLabel}
      </span>
      <DropdownSelect {...props} aria-labelledby={id} />
    </div>
  );
};

export const LabeledDropdownCascader: React.FC<WithAriaLabel<CascaderProps>> = ({ ariaLabel, ...props }) => {
  const id = useId();
  return (
    <div className="contents">
      <span
        id={id}
        className="absolute w-[1px] h-[1px] p-0 -m-0.25 overflow-hidden [clip:rect(0,_0,_0,_0)] whitespace-nowrap border-0"
      >
        {ariaLabel}
      </span>
      <DropdownCascader {...props} aria-labelledby={id} />
    </div>
  );
};
