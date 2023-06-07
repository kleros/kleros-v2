import {} from "styled-components";
import { lightTheme } from "./src/styles/themes";

declare global {
  module "*.svg" {
    const content: React.FC<React.SVGAttributes<SVGElement>>;
    export default content;
  }
  module "*.png" {
    const value: string;
    export default value;
  }
}

declare module "styled-components" {
  type Theme = typeof lightTheme;
  //eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends Theme {}
}
