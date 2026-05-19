import { css, DefaultTheme, FlattenInterpolation, ThemeProps } from "styled-components";

export const MAX_WIDTH_LANDSCAPE = "1400px";

export const BREAKPOINT_LANDSCAPE = 900;

// Below 1234px the absolutely-centered desktop nav gets squeezed under 50% of HeaderContainer,
// which makes flex children shrink and text wraps inside multi-word links (My Profile, etc.).
// At/above 1234px the desktop header renders; below it, the hamburger header takes over.
export const BREAKPOINT_HEADER_DESKTOP = 1234;

export const landscapeStyle = (styleFn: () => FlattenInterpolation<ThemeProps<DefaultTheme>>) => css`
  @media (min-width: ${BREAKPOINT_LANDSCAPE}px) {
    ${() => styleFn()}
  }
`;
