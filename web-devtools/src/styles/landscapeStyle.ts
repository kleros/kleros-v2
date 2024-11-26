import { type DefaultTheme, type ThemeProps, type FlattenInterpolation, css } from "styled-components";

export const BREAKPOINT_LANDSCAPE = 900;

export const landscapeStyle = (styleFn: () => FlattenInterpolation<ThemeProps<DefaultTheme>>) => css`
  @media (min-width: ${BREAKPOINT_LANDSCAPE}px) {
    ${() => styleFn()}
  }
`;
