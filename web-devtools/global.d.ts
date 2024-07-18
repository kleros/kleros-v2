import { DefaultTheme } from "styled-components";

import { darkTheme } from "@kleros/ui-components-library";

declare module "styled-components" {
  type Theme = typeof darkTheme;
  export interface DefaultTheme extends Theme {
    klerosUIComponentsSkeletonBackground: string;
    klerosUIComponentsSkeletonHighlight: string;
    klerosUIComponentsVioletPurple: string;
    klerosUIComponentsLavenderPurple: string;
  }
}
