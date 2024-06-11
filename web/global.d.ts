import {} from "styled-components";
import { lightTheme } from "styles/themes";

declare global {
  module "*.svg" {
    const content: React.FC<React.SVGAttributes<SVGElement>>;
    export default content;
  }
  module "*.png" {
    const path: string;
    export default path;
  }
}

declare module "styled-components" {
  type Theme = typeof lightTheme;
  //eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends Theme {}
}
