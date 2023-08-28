import { css, FlattenSimpleInterpolation } from "styled-components";

export const BREAKPOINT_SMALL_SCREEN = 768;

export const smallScreenStyle = (style: FlattenSimpleInterpolation) => css`
  @media (max-width: ${BREAKPOINT_SMALL_SCREEN}px) {
    ${style}
  }
`;
