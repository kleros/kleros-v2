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
  interface Window {
    google: {
      translate: {
        TranslateElement: new (
          config: {
            pageLanguage: string;
            includedLanguages: string;
          },
          elementId: string
        ) => void;
      };
    };
    googleTranslateElementInit: () => void;
  }
}

declare module "styled-components" {
  type Theme = typeof lightTheme;

  export interface DefaultTheme extends Theme {}
}

declare module "chart.js" {
  interface TooltipPositionerMap {
    custom: TooltipPositionerFunction<ChartType>;
  }
}
