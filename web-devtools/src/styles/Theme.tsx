import { DefaultTheme } from "styled-components";

import { darkTheme } from "@kleros/ui-components-library";

declare module "styled-components" {
  export interface DefaultTheme {
    klerosUIComponentsPrimaryPurple: string;
    klerosUIComponentsSecondaryPurple: string;
    klerosUIComponentsMediumPurple: string;
    klerosUIComponentsLightPurple: string;
    klerosUIComponentsPrimaryBlue: string;
    klerosUIComponentsSecondaryBlue: string;
    klerosUIComponentsMediumBlue: string;
    klerosUIComponentsLightBlue: string;
    klerosUIComponentsPrimaryText: string;
    klerosUIComponentsSecondaryText: string;
    klerosUIComponentsStroke: string;
    klerosUIComponentsLightGrey: string;
    klerosUIComponentsWhiteBackground: string;
    klerosUIComponentsLightBackground: string;
    klerosUIComponentsDefaultShadow: string;
    klerosUIComponentsHoveredShadow: string;
    klerosUIComponentsSuccess: string;
    klerosUIComponentsSuccessLight: string;
    klerosUIComponentsWarning: string;
    klerosUIComponentsWarningLight: string;
    klerosUIComponentsError: string;
    klerosUIComponentsErrorLight: string;
    klerosUIComponentsTint: string;
    klerosUIComponentsTintMedium: string;
    klerosUIComponentsTintPurple: string;
    klerosUIComponentsTransitionSpeed: string;
    klerosUIComponentsSkeletonBackground: string;
    klerosUIComponentsSkeletonHighlight: string;
    klerosUIComponentsVioletPurple: string;
    klerosUIComponentsLavenderPurple: string;
  }
}

export const theme: DefaultTheme = {
  ...darkTheme,
  klerosUIComponentsSkeletonBackground: "#EBEBEB",
  klerosUIComponentsSkeletonHighlight: "#F5F5F5",
  klerosUIComponentsVioletPurple: "#6A1DCD",
  klerosUIComponentsLavenderPurple: "#BB72FF",
};
