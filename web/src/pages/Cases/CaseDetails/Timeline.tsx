import React from "react";
import styled from "styled-components";
import { Periods } from "consts/periods";
import { DisputeDetailsQuery } from "queries/useDisputeDetailsQuery";
import { Box, Steps } from "@kleros/ui-components-library";
import { secondsToDayHourMinute, getTimeLeft } from "utils/date";

const Timeline: React.FC<{
  dispute: DisputeDetailsQuery["dispute"];
  currentPeriodIndex: number;
}> = ({ currentPeriodIndex, dispute }) => {
  const currentItemIndex = currentPeriodToCurrentItem(
    currentPeriodIndex,
    dispute?.ruled
  );
  return (
    <TimeLineContainer>
      <StyledSteps
        horizontal
        {...{ currentItemIndex }}
        items={getTimeline(dispute, currentItemIndex)}
      />
    </TimeLineContainer>
  );
};

const currentPeriodToCurrentItem = (
  currentPeriodIndex: number,
  ruled?: boolean
): number => {
  if (currentPeriodIndex <= Periods.Commit) return currentPeriodIndex;
  else if (currentPeriodIndex < Periods.Execution)
    return currentPeriodIndex - 1;
  else return ruled ? currentPeriodIndex : currentPeriodIndex - 1;
};

const getTimeline = (
  dispute: DisputeDetailsQuery["dispute"],
  currentItemIndex: number
) => {
  const titles = [
    "Evidence Period",
    "Voting Period",
    "Appeal Period",
    "Executed",
  ];
  const getSubitems = (index: number): string[] => {
    if (index < currentItemIndex) {
      return ["Done!"];
    } else if (index === currentItemIndex) {
      return [
        secondsToDayHourMinute(
          getTimeLeft(
            parseInt(dispute?.lastPeriodChange, 10),
            parseInt(dispute?.subcourtID.timesPerPeriod[index], 10)
          )
        ),
      ];
    } else if (index === 3) {
      return [];
    } else {
      return [
        secondsToDayHourMinute(dispute?.subcourtID.timesPerPeriod[index]),
      ];
    }
  };
  return titles.map((title, i) => ({
    title,
    subitems: getSubitems(i),
  }));
};

const TimeLineContainer = styled(Box)`
  width: 100%;
  height: 100px;
  border-radius: 3px;
  margin: 16px 0px;
  padding: 8px;
`;

const StyledSteps = styled(Steps)`
  width: 85%;
  margin: auto;
`;

export default Timeline;
