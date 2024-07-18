import React, { useCallback } from "react";
import styled, { useTheme } from "styled-components";

import { Chart as ChartJS, BarElement } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar } from "react-chartjs-2";
import "chartjs-adapter-moment";

const BarContainer = styled.div`
  height: 220px;
  margin-top: 16px;
`;

ChartJS.register(BarElement);

export type CasesByCourtsChartData = { labels: string[]; cases: number[]; totalCases: number };

interface ICasesByCourtsChart {
  data: CasesByCourtsChartData;
}

const CasesByCourtsChart: React.FC<ICasesByCourtsChart> = ({ data }) => {
  const theme = useTheme();
  const getPercentValue = useCallback((value: number) => `${Math.floor((value * 100) / data.totalCases)} %`, [data]);
  const tickSize = 5; // this is suggested, if that many labels can't fit, chart will use even labels

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    tooltips: {
      position: "nearest",
    },
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
          stepSize: (data.totalCases * tickSize) / 100,
          callback: (value) => getPercentValue(value),
        },
        max: data.totalCases,
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
      {
        // eslint-disable-next-line
        // @ts-ignore
        <Bar
          {...{
            data: {
              labels: data.labels,
              datasets: [
                {
                  data: data.cases,
                  backgroundColor: theme.secondaryPurple,
                  hoverBackgroundColor: theme.primaryBlue,
                  maxBarThickness: 60,
                },
              ],
            },
            options,
          }}
          plugins={[ChartDataLabels]}
        />
      }
    </BarContainer>
  );
};

export default CasesByCourtsChart;
