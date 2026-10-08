import React from "react";

import Chart from "./Chart";
import ExtraStats from "./ExtraStats";
import Header from "./Header";
import Stats from "./Stats";

const CourtOverview: React.FC = () => (
  <div className="w-full h-auto">
    <Header />
    <Chart />
    <Stats />
    <ExtraStats />
  </div>
);

export default CourtOverview;
