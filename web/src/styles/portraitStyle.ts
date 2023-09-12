import { css, FlattenSimpleInterpolation } from "styled-components";

export const BREAKPOINT_PORTRAIT = 600;

export const portraitStyle = (style: FlattenSimpleInterpolation) => css`
  @media (min-width: ${BREAKPOINT_PORTRAIT}px) {
    ${style}
  }
`;
