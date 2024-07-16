import React, { useMemo, useState } from "react";
import styled from "styled-components";

import { formatUnits } from "viem";

import { DropdownSelect } from "@kleros/ui-components-library";

import { useHomePageContext } from "hooks/useHomePageContext";

import { responsiveSize } from "styles/responsiveSize";

import { StyledSkeleton } from "components/StyledSkeleton";

import CasesByCourtsChart, { CasesByCourtsChartData } from "./CasesByCourtsChart";
import TimeSeriesChart from "./TimeSeriesChart";

const Container = styled.div`
  margin-bottom: ${responsiveSize(32, 48)};
  display: flex;
  flex-direction: column;
`;

const StyledDropdown = styled(DropdownSelect)`
  width: fit-content;
  align-self: end;
`;

const CHART_OPTIONS = [
  { text: "Staked PNK", value: "stakedPNK" },
  { text: "Cases", value: "cases" },
  { text: "Cases per court", value: "casesPerCourt" },
];

const ChartOptionsDropdown: React.FC<{
  setChartOption: (newValue: string) => void;
}> = ({ setChartOption }) => (
  <StyledDropdown
    smallButton
    simpleButton
    alignRight
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
      return {
        labels: [...accData.labels, current.name ?? ""],
        cases: [...accData.cases, current.numberDisputes],
        totalCases: accData.totalCases + parseInt(current.numberDisputes, 10),
      };
    },
    { labels: [], cases: [], totalCases: 0 }
  );

  const ChartComponent = useMemo(() => {
    switch (chartOption) {
      case "casesPerCourt":
        return processedCourtsData ? (
          <CasesByCourtsChart data={processedCourtsData} />
        ) : (
          <StyledSkeleton height={233} />
        );
      default:
        return processedData ? <TimeSeriesChart data={processedData} /> : <StyledSkeleton height={233} />;
    }
  }, [processedCourtsData, processedData, chartOption]);

  return (
    <Container>
      <ChartOptionsDropdown {...{ setChartOption }} />
      {ChartComponent}
    </Container>
  );
};

export default Chart;
