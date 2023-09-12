import { css, FlattenSimpleInterpolation } from "styled-components";

export const BREAKPOINT_LANDSCAPE = 900;

export const landscapeStyle = (style: FlattenSimpleInterpolation) => css`
  @media (min-width: ${BREAKPOINT_LANDSCAPE}px) {
    ${style}
  }
`;
