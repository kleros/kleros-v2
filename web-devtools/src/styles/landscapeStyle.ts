import { css, type RuleSet } from "styled-components";

export const BREAKPOINT_LANDSCAPE = 900;

export const landscapeStyle = (styleFn: () => RuleSet<object>) => css`
  @media (min-width: ${BREAKPOINT_LANDSCAPE}px) {
    ${() => styleFn()}
  }
`;
