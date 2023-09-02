import { css, DefaultTheme, FlattenInterpolation, ThemeProps } from "styled-components";

export const BREAKPOINT_SMALL_SCREEN = 768;
export const BREAKPOINT_TABLET_SCREEN = 1024;

export const smallScreenStyle = (styleFn: () => FlattenInterpolation<ThemeProps<DefaultTheme>>) => css`
  @media (max-width: ${BREAKPOINT_SMALL_SCREEN}px) {
    ${() => styleFn()}
  }
`;
