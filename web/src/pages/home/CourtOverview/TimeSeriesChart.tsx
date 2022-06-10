import React from "react";
import styled, { useTheme } from "styled-components";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-moment";

const LineContainer = styled.div`
  height: 220px;
  margin-top: 16px;
`;

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Tooltip
);

interface ITimeSeriesChart {
  data: { x: number; y: number }[];
}

const TimeSeriesChart: React.FC<ITimeSeriesChart> = ({ data }) => {
  const theme = useTheme();
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      point: {
        radius: 0,
      },
    },
    interaction: {
      axis: "x",
      intersect: false,
    },
    tooltips: {
      position: "nearest",
    },
    scales: {
      x: {
        type: "time",
        grid: { display: false },
        ticks: {
          color: theme.secondaryText,
        },
      },
      y: {
        grid: { color: theme.stroke },
        ticks: {
          color: theme.secondaryText,
        },
        suggestedMin: 0,
      },
    },
  };

  return (
    <LineContainer>
      {
        // eslint-disable-next-line
        // @ts-ignore
        <Line
          {...{
            data: {
              datasets: [
                {
                  data,
                  borderColor: theme.primaryBlue,
                  stepped: true,
                  cubicInterpolationMode: "monotone",
                },
              ],
            },
            options,
          }}
        />
      }
    </LineContainer>
  );
};

export default TimeSeriesChart;
