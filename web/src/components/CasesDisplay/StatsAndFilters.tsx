import React from "react";

import { cn } from "utils/cn";

import Filters from "./Filters";
import Stats, { IStats } from "./Stats";

const StatsAndFilters: React.FC<IStats> = ({ totalDisputes, closedDisputes }) => (
  <div
    className={cn(
      "flex flex-wrap gap-2 mt-[calc(4px_+_(8_-_4)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]",
      "mb-[calc(16px_+_(32_-_16)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] justify-between"
    )}
  >
    <Stats {...{ totalDisputes, closedDisputes }} />
    <Filters />
  </div>
);

export default StatsAndFilters;
