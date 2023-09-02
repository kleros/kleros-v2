import { css, DefaultTheme, FlattenInterpolation, ThemeProps } from "styled-components";

export const BREAKPOINT_SMALL_SCREEN = 1000;

export const smallScreenStyle = (styleFn: () => FlattenInterpolation<ThemeProps<DefaultTheme>>) => css`
  @media (max-width: ${BREAKPOINT_SMALL_SCREEN}px) {
    ${() => styleFn()}
  }
`;
