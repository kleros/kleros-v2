import React, { useId } from "react";
import styled from "styled-components";

import { DropdownCascader, DropdownSelect } from "@kleros/ui-components-library";

/**
 * Accessible wrappers around the library's DropdownSelect / DropdownCascader.
 *
 * @kleros/ui-components-library 3.8.0 hardcodes `aria-label="Select"` after the prop spread,
 * silently dropping caller-supplied `aria-label`. Workaround: pass `aria-labelledby` (which the
 * spread does forward) pointing to a visually-hidden span; per ARIA, labelledby wins.
 */

// Clip technique keeps the node in the accessibility tree (display: none would remove it).
const SrOnly = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

// display: contents so the wrapper doesn't break a parent flex/grid layout.
const Wrapper = styled.div`
  display: contents;
`;

type SelectProps = React.ComponentProps<typeof DropdownSelect>;
type CascaderProps = React.ComponentProps<typeof DropdownCascader>;

type WithAriaLabel<T> = Omit<T, "aria-label" | "aria-labelledby"> & { ariaLabel: string };

export const LabeledDropdownSelect: React.FC<WithAriaLabel<SelectProps>> = ({ ariaLabel, ...props }) => {
  const id = useId();
  return (
    <Wrapper>
      <SrOnly id={id}>{ariaLabel}</SrOnly>
      <DropdownSelect {...props} aria-labelledby={id} />
    </Wrapper>
  );
};

export const LabeledDropdownCascader: React.FC<WithAriaLabel<CascaderProps>> = ({ ariaLabel, ...props }) => {
  const id = useId();
  return (
    <Wrapper>
      <SrOnly id={id}>{ariaLabel}</SrOnly>
      <DropdownCascader {...props} aria-labelledby={id} />
    </Wrapper>
  );
};
