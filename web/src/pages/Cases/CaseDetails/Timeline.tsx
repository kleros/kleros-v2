import React, { useMemo } from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { Periods } from "consts/periods";
import { DisputeDetailsQuery } from "queries/useDisputeDetailsQuery";
import { Box, Steps } from "@kleros/ui-components-library";
import { StyledSkeleton } from "components/StyledSkeleton";
import { useCountdown } from "hooks/useCountdown";
import useIsDesktop from "hooks/useIsDesktop";
import { secondsToDayHourMinute } from "utils/date";
import { responsiveSize } from "styles/responsiveSize";

const TimeLineContainer = styled(Box)`
  display: block;
  width: 100%;
  height: 98px;
  border-radius: 0px;
  padding: ${responsiveSize(16, 48)} 8px 0px ${responsiveSize(12, 22)};
  margin-top: ${responsiveSize(16, 48)};
  margin-bottom: ${responsiveSize(12, 22)};
  background-color: ${({ theme }) => theme.whiteBackground};

  ${landscapeStyle(
    () => css`
      display: block;
      padding: 28px 8px 8px 8px;
    `
  )}
`;

const StyledSteps = styled(Steps)`
  display: flex;
  justify-content: space-between;
  width: 85%;
  margin: auto;
`;

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
  const isDesktop = useIsDesktop();
  const titles = useMemo(() => {
    const titles = ["Evidence", "Voting", "Appeal", "Executed"];
    if (dispute?.court.hiddenVotes) {
      titles.splice(1, 0, "Commit");
    }
    return titles;
  }, [dispute]);
  const deadlineCurrentPeriod = getDeadline(
    currentPeriodIndex,
    dispute?.lastPeriodChange,
    dispute?.court.timesPerPeriod
  );
  const countdown = useCountdown(deadlineCurrentPeriod);
  const getSubitems = (index: number): string[] | React.ReactNode[] => {
    if (typeof countdown !== "undefined" && dispute) {
      if (index === titles.length - 1) {
        return [];
      } else if (index === currentItemIndex && countdown === 0) {
        return ["Time's up!"];
      } else if (index < currentItemIndex) {
        return [];
      } else if (index === currentItemIndex) {
        return [secondsToDayHourMinute(countdown)];
      } else {
        return [secondsToDayHourMinute(dispute?.court.timesPerPeriod[index])];
      }
    }
    return [<StyledSkeleton key={index} width={60} />];
  };
  return titles.map((title, i) => ({
    title: i + 1 < titles.length && isDesktop ? `${title} Period` : title,
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

export default Timeline;
