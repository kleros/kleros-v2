import { css, DefaultTheme, FlattenInterpolation, ThemeProps } from "styled-components";

export const BREAKPOINT_LANDSCAPE = 900;

export const landscapeStyle = (styleFn: () => FlattenInterpolation<ThemeProps<DefaultTheme>>) => css`
  @media (min-width: ${BREAKPOINT_LANDSCAPE}px) {
    ${() => styleFn()}
  }
`;
