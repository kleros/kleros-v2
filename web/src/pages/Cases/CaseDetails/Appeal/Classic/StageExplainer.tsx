import React from "react";
import styled from "styled-components";
import { Box } from "@kleros/ui-components-library";
import { secondsToDayHourMinute, getTimeLeft } from "utils/date";

const StageExplainer: React.FC = () => {
  // const timeLeft = secondsToDayHourMinute(
  //   getTimeLeft(
  //     parseInt(dispute?.lastPeriodChange, 10),
  //     parseInt(dispute?.courtID.timesPerPeriod[index], 10)
  //   )
  // );
  return (
    <StyledBox>
      <StageIndicator />
      <div>
        <small>One of the losing options must be fully funded.</small>
        <small>
          If no option is fully funded in time, the jury decision is maintained.
        </small>
      </div>
    </StyledBox>
  );
};

const StyledBox = styled(Box)`
  border-radius: 3px;
  margin: 24px 0;
  height: auto;
  width: 100%;
  padding: 16px 0;
  padding-right: 24px;
  display: flex;
  align-items: center;
  small {
    display: block;
  }
`;

const StageIndicator: React.FC = () => (
  <IndicatorContainer>
    <h2>Stage</h2>
    <h1>1</h1>
  </IndicatorContainer>
);

const IndicatorContainer = styled.div`
  flex-shrink: 0;
  border-right: 1px solid ${({ theme }) => theme.secondaryPurple};
  margin-right: 24px;
  height: 70px;
  width: 100px;
  > h2 {
    color: ${({ theme }) => theme.secondaryPurple};
    margin-bottom: 8px;
    text-align: center;
  }
  > h1 {
    color: ${({ theme }) => theme.secondaryPurple};
    margin: 0px;
    text-align: center;
  }
`;

export default StageExplainer;
