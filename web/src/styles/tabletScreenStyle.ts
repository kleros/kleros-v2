import { css, DefaultTheme, FlattenInterpolation, ThemeProps } from "styled-components";

export const BREAKPOINT_TABLET_SCREEN = 1024;

export const tabletScreenStyle = (styleFn: () => FlattenInterpolation<ThemeProps<DefaultTheme>>) => css`
  @media (max-width: ${BREAKPOINT_TABLET_SCREEN}px) {
    ${() => styleFn()}
  }
`;
