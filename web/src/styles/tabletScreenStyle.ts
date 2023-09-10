import { css, FlattenSimpleInterpolation } from "styled-components";

export const BREAKPOINT_TABLET_SCREEN = 1024;

export const tabletScreenStyle = (style: FlattenSimpleInterpolation) => css`
  @media (max-width: ${BREAKPOINT_TABLET_SCREEN}px) {
    ${style}
  }
`;
