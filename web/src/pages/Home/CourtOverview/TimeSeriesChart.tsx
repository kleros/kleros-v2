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
  ScriptableContext,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-moment";

const LineContainer = styled.div`
  height: 220px;
  margin-top: 16px;
`;

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, TimeScale, Tooltip);

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
    plugins: {
      tooltip: {
        position: "custom",
        backgroundColor: theme.whiteBackground,
        titleColor: theme.primaryText,
        borderColor: theme.stroke,
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          labelTextColor: () => theme.primaryText,
        },
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
                  // borderColor: theme.primaryBlue,
                  stepped: true,
                  cubicInterpolationMode: "monotone",
                  borderColor: (context: ScriptableContext<"line">) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                    gradient.addColorStop(0, theme.primaryBlue);
                    gradient.addColorStop(1, theme.secondaryPurple);
                    return gradient;
                  },
                },
              ],
            },
            options,
          }}
          plugins={[
            {
              id: "line-draw",
              afterDatasetsDraw: (chart) => {
                if (chart.tooltip?._active?.length) {
                  const x = chart.tooltip._active[0].element.x;
                  const y = chart.tooltip._active[0].element.y;
                  const yAxis = chart.scales.y;

                  const ctx = chart.ctx;
                  ctx.save();
                  ctx.beginPath();
                  ctx.moveTo(x, y);
                  ctx.lineTo(x, yAxis.bottom);
                  ctx.lineWidth = 1;
                  ctx.strokeStyle = theme.secondaryPurple;
                  ctx.setLineDash([4, 4]);
                  ctx.stroke();
                  ctx.restore();
                }
              },
            },
          ]}
        />
      }
    </LineContainer>
  );
};
export default TimeSeriesChart;
