import React from "react";
import BarChart, { IBarChartData } from "./BarChart";

export type CasesByCourtsChartData = { labels: string[]; cases: number[]; totalCases: number };

interface ICasesByCourtsChart {
  data: CasesByCourtsChartData;
}

const CasesByCourtsChart: React.FC<ICasesByCourtsChart> = ({ data }) => {
  const chartData: IBarChartData = {
    labels: data.labels,
    data: data.cases,
    total: data.totalCases,
  };

  return <BarChart chartData={chartData} />;
};

export default CasesByCourtsChart;
