import React, { useState } from "react";
import styled from "styled-components";
import TimeSeriesChart from "./TimeSeriesChart";
import { DropdownSelect } from "@kleros/ui-components-library";
import { StyledSkeleton } from "components/StyledSkeleton";
import { formatUnits } from "viem";
import { useHomePageContext } from "hooks/useHomePageContext";
import { responsiveSize } from "styles/responsiveSize";

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
  { text: "Cases per court", value: 2 },
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
  const processedData = chartData?.reduce((accData: IChartData[], counter) => {
    return [
      ...accData,
      {
        x: Number(counter.id) * 1000,
        y: Number(chartOption === "stakedPNK" ? formatUnits(counter[chartOption], 18) : counter[chartOption]),
      },
    ];
  }, []);

  return (
    <Container>
      <ChartOptionsDropdown {...{ setChartOption }} />
      {processedData ? <TimeSeriesChart data={processedData} /> : <StyledSkeleton height={233} />}
    </Container>
  );
};

export default Chart;
