import React, { useState } from "react";
import styled from "styled-components";
import TimeSeriesChart from "./TimeSeriesChart";
import { DropdownSelect } from "@kleros/ui-components-library";
import { utils } from "ethers";
import { useHomePageContext } from "hooks/useHomePageContext";

const Container = styled.div`
  margin-bottom: 32px;
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
    callback={(newValue: string) => {
      setChartOption(newValue);
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
  const chartData = data?.counters[chartOption];
  console.log(chartData);
  const processedData = chartData?.reduce(
    (accData: IChartData[], { id, value }: { id: string; value: string }) => {
      return [
        ...accData,
        {
          x: Number(id) * 1000,
          y: Number(
            chartOption === "stakedPNK" ? utils.formatUnits(value, 18) : value
          ),
        },
      ];
    },
    []
  );

  return (
    <Container>
      <ChartOptionsDropdown {...{ setChartOption }} />
      {processedData ? <TimeSeriesChart data={processedData} /> : "Fetching..."}
    </Container>
  );
};

export default Chart;
