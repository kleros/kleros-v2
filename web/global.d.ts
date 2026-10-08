import type { ChartType, TooltipPositionerFunction } from "chart.js";

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

declare module "chart.js" {
  interface TooltipPositionerMap {
    custom: TooltipPositionerFunction<ChartType>;
  }
}
