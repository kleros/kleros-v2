import React from "react";
import styled, { css } from "styled-components";
import { tabletScreenStyle } from "styles/tabletScreenStyle";
import { Periods } from "consts/periods";
import { DisputeDetailsQuery } from "queries/useDisputeDetailsQuery";
import { Box, Steps } from "@kleros/ui-components-library";
import { StyledSkeleton } from "components/StyledSkeleton";
import { useCountdown } from "hooks/useCountdown";
import { secondsToDayHourMinute } from "utils/date";

const TimeLineContainer = styled(Box)`
  display: flex;
  width: 100%;
  height: 98px;
  border-radius: 0px;
  margin-top: calc(16px + (48 - 16) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  margin-bottom: calc(12px + (22 - 12) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  background-color: ${({ theme }) => theme.whiteBackground};

  ${tabletScreenStyle(
    () => css`
      padding: 20px 8px 8px 8px;
      display: block;
    `
  )}
`;

const StyledSteps = styled(Steps)`d
  display: flex;
  justify-content: space-between;
  width: 85%;
  margin: auto;
`;

const TitleMobile = styled.span`
  display: none;

  ${tabletScreenStyle(
    () => css`
      display: inline-block;
    `
  )}
`;

const TitleDesktop = styled(TitleMobile)`
  display: inline-block;

  ${tabletScreenStyle(
    () => css`
      display: none;
    `
  )}
`;

const Timeline: React.FC<{
  dispute: DisputeDetailsQuery["dispute"];
  currentPeriodIndex: number;
}> = ({ currentPeriodIndex, dispute }) => {
  const currentItemIndex = currentPeriodToCurrentItem(currentPeriodIndex, dispute?.ruled);
  const items = useTimeline(dispute, currentItemIndex, currentItemIndex);
  return (
    <TimeLineContainer>
      <StyledSteps horizontal {...{ items, currentItemIndex, currentPeriodIndex }} />
    </TimeLineContainer>
  );
};

const currentPeriodToCurrentItem = (currentPeriodIndex: number, ruled?: boolean): number => {
  if (currentPeriodIndex <= Periods.commit) return currentPeriodIndex;
  else if (currentPeriodIndex < Periods.execution) return currentPeriodIndex - 1;
  else return ruled ? 5 : currentPeriodIndex - 1;
};

const useTimeline = (dispute: DisputeDetailsQuery["dispute"], currentItemIndex: number, currentPeriodIndex: number) => {
  const titles = [
    { mobile: "Evidence", desktop: "Evidence Period" },
    { mobile: "Voting", desktop: "Voting Period" },
    { mobile: "Appeal", desktop: "Appeal Period" },
    { mobile: "Executed", desktop: "Executed" },
  ];
  const deadlineCurrentPeriod = getDeadline(
    currentPeriodIndex,
    dispute?.lastPeriodChange,
    dispute?.court.timesPerPeriod
  );
  const countdown = useCountdown(deadlineCurrentPeriod);
  const getSubitems = (index: number): string[] | React.ReactNode[] => {
    if (typeof countdown !== "undefined" && dispute) {
      if (index === currentItemIndex && countdown === 0) {
        return ["Time's up!"];
      } else if (index < currentItemIndex) {
        return [];
      } else if (index === 3) {
        return currentItemIndex === 3 ? ["Pending"] : [];
      } else if (index === currentItemIndex) {
        return [secondsToDayHourMinute(countdown)];
      } else {
        return [secondsToDayHourMinute(dispute?.court.timesPerPeriod[index])];
      }
    }
    return [<StyledSkeleton key={index} width={60} />];
  };
  return titles.map((title, i) => ({
    title: (
      <>
        <TitleMobile>{title.mobile}</TitleMobile>
        <TitleDesktop>{title.desktop}</TitleDesktop>
      </>
    ),
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
