import { css } from "styled-components";

export const hoverShortTransitionTiming = css`
  transition: 0.1s;
`;

export const hoverLongTransitionTiming = css`
  transition: 0.2s;
`;

/* TODO(ui-components-library): remove once Tabs paints its selection from react-aria's render
   props, kleros/ui-components-library#90.
   3.9.0 Tabs paints the underline from internal state that is seeded by `defaultSelectedKey`
   and updated only on click, so it drifts from a controlled `selectedKey` when the route
   changes. react-aria marks the real selection with `data-selected`; paint from that instead.
   Unlayered, so it wins over the library's @layer utilities. */
export const tabsSelectedUnderline = css`
  [role="tab"] {
    border-bottom-color: ${({ theme }) => theme.stroke};
    span {
      color: ${({ theme }) => theme.primaryText};
    }
    svg {
      fill: ${({ theme }) => theme.primaryText};
    }
  }
  [role="tab"]:not([data-selected]):not([data-disabled]):hover {
    border-bottom-color: ${({ theme }) => theme.secondaryBlue};
  }
  [role="tab"][data-selected] {
    border-bottom-color: ${({ theme }) => theme.primaryBlue};
    span {
      color: ${({ theme }) => theme.primaryBlue};
    }
    svg {
      fill: ${({ theme }) => theme.primaryBlue};
    }
  }
  [role="tab"][data-disabled] {
    span {
      color: ${({ theme }) => theme.stroke};
    }
    svg {
      fill: ${({ theme }) => theme.stroke};
    }
  }
`;

/* TODO(ui-components-library): remove once NumberField/BigNumberField take a `hideStepper` prop
   (kleros/ui-components-library#98).
   Hides the hover-revealed ±1 arrows of a BigNumberField where stepping makes no sense (an ID)
   or where they would overlap a suffix drawn in the input (the ETH amount). Relies on the library's DOM:
   the arrows sit in the first div of `.input-wrapper` and carry a fixed English aria-label. */
export const hideBigNumberFieldSteppers = css`
  & .input-wrapper > div:has(> button[aria-label="Increment"]) {
    display: none;
  }
`;
