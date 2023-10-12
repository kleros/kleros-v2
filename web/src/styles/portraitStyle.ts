import { css, DefaultTheme, FlattenInterpolation, ThemeProps } from "styled-components";

export const BREAKPOINT_PORTRAIT = 600;

export const portraitStyle = (styleFn: () => FlattenInterpolation<ThemeProps<DefaultTheme>>) => css`
  @media (min-width: ${BREAKPOINT_PORTRAIT}px) {
    ${() => styleFn()}
  }
`;
