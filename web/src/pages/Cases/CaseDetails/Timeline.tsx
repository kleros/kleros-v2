import React from "react";
import styled from "styled-components";
import { Periods } from "consts/periods";
import { DisputeDetailsQuery } from "queries/useDisputeDetailsQuery";
import { Box, Steps } from "@kleros/ui-components-library";
import { useCountdown } from "hooks/useCountdown";
import { secondsToDayHourMinute, getTimeLeft } from "utils/date";

const Timeline: React.FC<{
  dispute: DisputeDetailsQuery["dispute"];
  currentPeriodIndex: number;
}> = ({ currentPeriodIndex, dispute }) => {
  const currentItemIndex = currentPeriodToCurrentItem(
    currentPeriodIndex,
    dispute?.ruled
  );
  const items = useTimeline(dispute, currentItemIndex, currentItemIndex);
  return (
    <TimeLineContainer>
      <StyledSteps
        horizontal
        {...{ items, currentItemIndex, currentPeriodIndex }}
      />
    </TimeLineContainer>
  );
};

const currentPeriodToCurrentItem = (
  currentPeriodIndex: number,
  ruled?: boolean
): number => {
  if (currentPeriodIndex <= Periods.commit) return currentPeriodIndex;
  else if (currentPeriodIndex < Periods.execution)
    return currentPeriodIndex - 1;
  else return ruled ? currentPeriodIndex : currentPeriodIndex - 1;
};

const useTimeline = (
  dispute: DisputeDetailsQuery["dispute"],
  currentItemIndex: number,
  currentPeriodIndex: number
) => {
  const titles = [
    "Evidence Period",
    "Voting Period",
    "Appeal Period",
    "Executed",
  ];
  const parsedLastPeriodChange = parseInt(dispute?.lastPeriodChange, 10);
  const parsedTimeCurrentPeriod =
    dispute && dispute?.court.timesPerPeriod.length > currentPeriodIndex
      ? parseInt(dispute?.court.timesPerPeriod[currentPeriodIndex])
      : 0;
  const countdown = useCountdown(
    parsedLastPeriodChange + parsedTimeCurrentPeriod
  );
  const getSubitems = (index: number): string[] => {
    if (index < currentItemIndex) {
      return ["Done!"];
    } else if (index === 3) {
      return currentItemIndex === 3 ? ["Pending"] : [];
    } else if (index === currentItemIndex) {
      return [secondsToDayHourMinute(countdown)];
    } else {
      return [secondsToDayHourMinute(dispute?.court.timesPerPeriod[index])];
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
