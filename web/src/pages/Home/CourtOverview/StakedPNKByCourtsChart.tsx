import React from "react";
import BarChart, { IBarChartData } from "./BarChart";

export type StakedPNKByCourtsChartData = { labels: string[]; stakes: number[]; totalStake: number };

interface IStakedPNKByCourtsChart {
  data: StakedPNKByCourtsChartData;
}

const StakedPNKByCourtsChart: React.FC<IStakedPNKByCourtsChart> = ({ data }) => {
  const chartData: IBarChartData = {
    labels: data.labels,
    data: data.stakes,
    total: data.totalStake,
  };

  return <BarChart chartData={chartData} />;
};

export default StakedPNKByCourtsChart;
