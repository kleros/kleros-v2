import React from "react";

import Filters from "./Filters";
import Stats, { IStats } from "./Stats";

const StatsAndFilters: React.FC<IStats> = ({ totalVotes, votesPending, resolvedVotes }) => (
  <div className="flex flex-wrap gap-2 mb-[calc(4px_+_(12_-_4)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] justify-between">
    <Stats {...{ totalVotes, votesPending, resolvedVotes }} />
    <Filters />
  </div>
);

export default StatsAndFilters;
