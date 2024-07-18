import { DefaultTheme } from "styled-components";
import { theme } from "styles/Theme";
declare module "styled-components" {
  type Theme = typeof theme;
  export interface DefaultTheme extends Theme {}
}
