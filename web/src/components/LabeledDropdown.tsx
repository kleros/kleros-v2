import React, { useId } from "react";
import styled from "styled-components";

import { DropdownCascader, DropdownSelect } from "@kleros/ui-components-library";

import { SrOnly } from "components/SrOnly";

/**
 * TODO(ui-components-library): delete these wrappers and pass `aria-label` directly once
 * kleros/ui-components-library#96 ships.
 *
 * Accessible wrappers around the library's DropdownSelect / DropdownCascader.
 * 3.9.0 hardcodes `aria-label="Select"` after the prop spread, silently dropping caller-supplied
 * `aria-label`. Workaround: pass `aria-labelledby` (which the spread does forward) pointing to a
 * visually-hidden span; per ARIA, labelledby wins.
 */

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
