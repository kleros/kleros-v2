import React, { useCallback, useMemo } from "react";
import styled, { useTheme } from "styled-components";

import {
  Chart as ChartJS,
  BarElement,
  Tooltip,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  ChartOptions,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar } from "react-chartjs-2";
import "chartjs-adapter-moment";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, TimeScale, Tooltip);
const formatter = new Intl.NumberFormat("en", { notation: "compact" });

const BarContainer = styled.div`
  height: 220px;
  margin-top: 16px;
`;

ChartJS.register(BarElement);

export interface IBarChartData {
  labels: string[];
  data: number[];
  total: number;
}

interface IBarChartProps {
  chartData: IBarChartData;
}

const BarChart: React.FC<IBarChartProps> = ({ chartData }) => {
  const theme = useTheme();
  const getPercentValue = useCallback(
    (value: number) => `${Math.floor((value * 100) / chartData.total)} %`,
    [chartData]
  );

  const formatPNKValue = useCallback((value: number) => formatter.format(value), []);

  const sortedData = useMemo(() => {
    const sortedIndices = chartData.data.map((value, index) => ({ value, index })).sort((a, b) => b.value - a.value);

    return {
      labels: sortedIndices.map((item) => chartData.labels[item.index]),
      data: sortedIndices.map((item) => chartData.data[item.index]),
      total: chartData.total,
    };
  }, [chartData]);

  const tickSize = 5; // suggested, if that many labels can't fit, chart will use even labels

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: theme.secondaryText,
        },
      },
      y: {
        grid: { color: theme.stroke, borderDash: [4, 4] },
        ticks: {
          color: theme.secondaryText,
          stepSize: (chartData.total * tickSize) / 100,
          callback: (value) => getPercentValue(value),
        },
        max: chartData.total,
      },
    },
    plugins: {
      datalabels: {
        anchor: "end",
        align: "top",
        offset: -4,
        color: theme.primaryText,
        font: {
          weight: "bold",
        },
        formatter: formatPNKValue,
      },
      tooltip: {
        backgroundColor: theme.whiteBackground,
        titleColor: theme.primaryText,
        borderColor: theme.stroke,
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: (context) => getPercentValue(context.parsed.y),
          labelTextColor: () => theme.primaryText,
        },
      },
    },
  };

  return (
    <BarContainer>
      <Bar
        data={{
          labels: sortedData.labels,
          datasets: [
            {
              data: sortedData.data,
              backgroundColor: theme.secondaryPurple,
              hoverBackgroundColor: theme.primaryBlue,
              maxBarThickness: 60,
              borderRadius: 3,
            },
          ],
        }}
        options={options}
        plugins={[ChartDataLabels]}
      />
    </BarContainer>
  );
};

export default BarChart;
