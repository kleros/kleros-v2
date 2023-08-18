import React, { useMemo } from "react";
import styled from "styled-components";
import { Periods } from "consts/periods";
import { DisputeDetailsQuery } from "queries/useDisputeDetailsQuery";
import { Box, Steps } from "@kleros/ui-components-library";
import { useCountdown } from "hooks/useCountdown";
import { secondsToDayHourMinute } from "utils/date";

const Timeline: React.FC<{
  dispute: DisputeDetailsQuery["dispute"];
  currentPeriodIndex: number;
}> = ({ currentPeriodIndex, dispute }) => {
  const currentItemIndex = currentPeriodToCurrentItem(currentPeriodIndex, dispute?.court.hiddenVotes);
  const items = useTimeline(dispute, currentItemIndex, currentItemIndex);
  return (
    <TimeLineContainer>
      <StyledSteps horizontal {...{ items, currentItemIndex, currentPeriodIndex }} />
    </TimeLineContainer>
  );
};

const currentPeriodToCurrentItem = (currentPeriodIndex: number, hiddenVotes?: boolean): number => {
  if (hiddenVotes) return currentPeriodIndex;
  if (currentPeriodIndex <= Periods.commit) return currentPeriodIndex;
  else return currentPeriodIndex - 1;
};

const useTimeline = (dispute: DisputeDetailsQuery["dispute"], currentItemIndex: number, currentPeriodIndex: number) => {
  const titles = useMemo(() => {
    const titles = ["Evidence Period", "Voting Period", "Appeal Period", "Executed"];
    if (dispute?.court.hiddenVotes) {
      titles.splice(1, 0, "Appeal Period");
    }
    return titles;
  }, [dispute]);
  const deadlineCurrentPeriod = getDeadline(
    currentPeriodIndex,
    dispute?.lastPeriodChange,
    dispute?.court.timesPerPeriod
  );
  const countdown = useCountdown(deadlineCurrentPeriod);
  const getSubitems = (index: number): string[] => {
    if (typeof countdown !== "undefined" && dispute) {
      if (index === currentItemIndex && countdown === 0) {
        return ["Time's up!"];
      } else if (index < currentItemIndex) {
        return [];
      } else if (index === titles.length) {
        return dispute?.ruled ? [] : ["Pending"];
      } else if (index === currentItemIndex) {
        return [secondsToDayHourMinute(countdown)];
      } else {
        return [secondsToDayHourMinute(dispute?.court.timesPerPeriod[index])];
      }
    }
    return ["Loading..."];
  };
  return titles.map((title, i) => ({
    title,
    subitems: getSubitems(i),
  }));
};

const getDeadline = (
  currentPeriodIndex: number,
  lastPeriodChange?: string,
  timesPerPeriod?: string[]
): number | undefined => {
  if (lastPeriodChange && timesPerPeriod && currentPeriodIndex < timesPerPeriod.length) {
    const parsedLastPeriodChange = parseInt(lastPeriodChange, 10);
    const parsedTimeCurrentPeriod = parseInt(timesPerPeriod[currentPeriodIndex]);
    return parsedLastPeriodChange + parsedTimeCurrentPeriod;
  }
  return 0;
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
