import React from "react";
import styled from "styled-components";
import TimeSeriesChart from "./TimeSeriesChart";
import { DropdownSelect } from "@kleros/ui-components-library";
import { utils } from "ethers";
import { useChartQuery } from "queries/useChartQuery";

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
  { text: "Staked PNK", value: 0 },
  { text: "Cases", value: 1 },
  { text: "Cases per court", value: 2 },
];

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

  return (
    <Container>
      <StyledDropdown
        smallButton
        simpleButton
        alignRight
        defaultValue={0}
        items={CHART_OPTIONS}
        callback={() => {
          // hey
        }}
      />
      {processedData ? <TimeSeriesChart data={processedData} /> : "Fetching..."}
    </Container>
  );
};

export default Chart;
