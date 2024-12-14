import { css } from "styled-components";

export const hoverShortTransitionTiming = css`
  :hover {
    transition: 0.1s;
  }

  :not(:hover) {
    transition: 0.1s;
  }
`;

export const hoverLongTransitionTiming = css`
  :hover {
    transition: 0.2s;
  }

  :not(:hover) {
    transition: 0.2s;
  }
`;
