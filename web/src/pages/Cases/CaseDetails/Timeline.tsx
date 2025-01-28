import React, { useMemo } from "react";
import styled, { css } from "styled-components";

import { Box, Steps } from "@kleros/ui-components-library";

import HourglassIcon from "svgs/icons/hourglass.svg";

import { Periods } from "consts/periods";
import { useCountdownContext, useFundingContext } from "hooks/useClassicAppealContext";
import { useCountdown } from "hooks/useCountdown";
import useIsDesktop from "hooks/useIsDesktop";
import { secondsToDayHourMinute } from "utils/date";

import { DisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import { isUndefined } from "src/utils";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import { StyledSkeleton } from "components/StyledSkeleton";

const TimeLineContainer = styled(Box)`
  width: 100%;
  height: auto;
  border-radius: 0px;
  background-color: transparent;
`;

const StyledSteps = styled(Steps)`
  display: flex;
  justify-content: space-between;
  width: 89%;
  margin: auto;

  h2 {
    font-size: ${responsiveSize(12, 14)};
  }

  [class*="horizontal-bullet__TextWrapper"] {
    margin-top: 2px;
  }

  ${landscapeStyle(
    () => css`
      width: 98%;
    `
  )}
`;

const AppealBannerContainer = styled.div`
  background-color: ${({ theme }) => theme.whiteBackground};
  border-radius: 3px;
  margin-top: 16px;
  padding: 12px;
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  & > svg {
    width: 14px;
    fill: ${({ theme }) => theme.secondaryPurple};
  }
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
      {currentPeriodIndex === Periods.appeal ? <AppealBanner /> : null}
    </TimeLineContainer>
  );
};

const AppealBanner: React.FC = () => {
  const { loserSideCountdown, winnerSideCountdown } = useCountdownContext();
  const { fundedChoices } = useFundingContext();

  const text = useMemo(() => {
    if (loserSideCountdown)
      return `${secondsToDayHourMinute(loserSideCountdown)} left until losing options can be funded`;
    // only show if loosing option was funded and winner needs funding, else no action is needed from user
    if (winnerSideCountdown && !isUndefined(fundedChoices) && fundedChoices.length > 0)
      return `${secondsToDayHourMinute(winnerSideCountdown)} left until winning option can be funded`;
    return;
  }, [loserSideCountdown, winnerSideCountdown, fundedChoices]);

  return text ? (
    <AppealBannerContainer>
      <HourglassIcon /> <small>{text}</small>
    </AppealBannerContainer>
  ) : null;
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
