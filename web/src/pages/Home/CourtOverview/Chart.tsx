import React, { useMemo, useState } from "react";
import styled from "styled-components";

import { responsiveSize } from "styles/responsiveSize";

import { Tooltip } from "chart.js";
import { formatUnits } from "viem";

import { DropdownSelect } from "@kleros/ui-components-library";

import { useHomePageContext } from "hooks/useHomePageContext";

import { StyledSkeleton } from "components/StyledSkeleton";

import CasesByCourtsChart, { CasesByCourtsChartData } from "./CasesByCourtsChart";
import StakedPNKByCourtsChart, { StakedPNKByCourtsChartData } from "./StakedPNKByCourtsChart";
import TimeSeriesChart from "./TimeSeriesChart";

const Container = styled.div`
  margin-bottom: ${responsiveSize(16, 32)};
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StyledDropdown = styled(DropdownSelect)`
  width: fit-content;
  align-self: start;
`;

const CHART_OPTIONS = [
  { text: "Staked PNK", value: "stakedPNK" },
  { text: "Staked PNK per court", value: "stakedPNKPerCourt" },
  { text: "Cases", value: "cases" },
  { text: "Cases per court", value: "casesPerCourt" },
];

const ChartOptionsDropdown: React.FC<{
  setChartOption: (newValue: string) => void;
}> = ({ setChartOption }) => (
  <StyledDropdown
    smallButton
    simpleButton
    defaultValue={"stakedPNK"}
    items={CHART_OPTIONS}
    callback={(newValue: string | number) => {
      if (typeof newValue === "string") {
        setChartOption(newValue);
      }
    }}
  />
);

interface IChartData {
  x: number;
  y: number;
}

const Chart: React.FC = () => {
  const [chartOption, setChartOption] = useState("stakedPNK");
  const { data } = useHomePageContext();
  const chartData = data?.counters;
  const courtsChartData = data?.courts;

  const processedData = chartData?.reduce((accData: IChartData[], counter) => {
    return [
      ...accData,
      {
        x: Number(counter.id) * 1000,
        y: Number(chartOption === "stakedPNK" ? formatUnits(counter[chartOption], 18) : counter[chartOption]),
      },
    ];
  }, []);

  const processedCourtsData = courtsChartData?.reduce(
    (accData: CasesByCourtsChartData, current) => {
      if (BigInt(current.numberDisputes) > 0) {
        return {
          labels: [...accData.labels, current.name ?? ""],
          cases: [...accData.cases, current.numberDisputes],
          totalCases: accData.totalCases + parseInt(current.numberDisputes, 10),
        };
      }
      return accData;
    },
    { labels: [], cases: [], totalCases: 0 }
  );

  const processedStakedPNKData = courtsChartData?.reduce(
    (accData: StakedPNKByCourtsChartData, current) => {
      if (BigInt(current.effectiveStake) > 0) {
        return {
          labels: [...accData.labels, current.name ?? ""],
          stakes: [...accData.stakes, parseFloat(formatUnits(current.effectiveStake, 18))],
          totalStake: accData.totalStake + parseFloat(formatUnits(current.effectiveStake, 18)),
        };
      }
      return accData;
    },
    { labels: [], stakes: [], totalStake: 0 }
  );

  const ChartComponent = useMemo(() => {
    switch (chartOption) {
      case "casesPerCourt":
        return processedCourtsData ? (
          <CasesByCourtsChart data={processedCourtsData} />
        ) : (
          <StyledSkeleton height={234} />
        );
      case "stakedPNKPerCourt":
        return processedStakedPNKData ? (
          <StakedPNKByCourtsChart data={processedStakedPNKData} />
        ) : (
          <StyledSkeleton height={234} />
        );
      default:
        return processedData ? <TimeSeriesChart data={processedData} /> : <StyledSkeleton height={234} />;
    }
  }, [processedCourtsData, processedStakedPNKData, processedData, chartOption]);

  return (
    <Container>
      <ChartOptionsDropdown {...{ setChartOption }} />
      {ChartComponent}
    </Container>
  );
};

// custom positioner for tooltip, we need dynamic top positioning, which is not available by default.
Tooltip.positioners.custom = function (elements) {
  const tooltip = this;
  const height = tooltip.chart.chartArea.height;
  const width = tooltip.chart.chartArea.width;

  const x = elements[0]?.element.x;
  const y = elements[0]?.element.y;
  const isAtTop = height > y + tooltip.height;
  const isAtEnd = width < x + tooltip.width;

  return {
    x: elements[0]?.element.x,
    y: elements[0]?.element.y,
    xAlign: isAtTop ? (isAtEnd ? "right" : "left") : "center",
    yAlign: isAtTop ? "center" : "bottom",
  };
};

export default Chart;
