import React from "react";
import styled, { useTheme } from "styled-components";
import { utils } from "ethers";
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
import { useChartQuery } from "queries/useChartQuery";
import "chartjs-adapter-moment";

const Container = styled.div`
  height: 220px;
`;

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Tooltip
);

const Chart: React.FC = () => {
  const { result } = useChartQuery();
  const pnkstakedDataPoints = result?.pnkstakedDataPoints;
  const processedData = pnkstakedDataPoints?.reduce((data, { id, value }) => {
    return [
      ...data,
      {
        x: parseInt(id) * 1000,
        y: parseInt(utils.formatUnits(value, 18)),
      },
    ];
  }, []);
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
    <Container>
      {processedData ? (
        // eslint-disable-next-line
        // @ts-ignore
        <Line
          {...{
            data: {
              datasets: [
                {
                  data: processedData,
                  borderColor: theme.primaryBlue,
                  stepped: true,
                  cubicInterpolationMode: "monotone",
                },
              ],
            },
            options,
          }}
        />
      ) : (
        "Fetching..."
      )}
    </Container>
  );
};

export default Chart;
