import React, { useMemo } from "react";

import { useTranslation } from "react-i18next";

import { Box, Steps } from "@kleros/ui-components-library";

import HourglassIcon from "svgs/icons/hourglass.svg";

import { Periods } from "consts/periods";
import { useCountdownContext, useFundingContext } from "hooks/useClassicAppealContext";
import { useCountdown } from "hooks/useCountdown";
import useIsDesktop from "hooks/useIsDesktop";
import { secondsToDayHourMinute } from "utils/date";

import { DisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import { isUndefined } from "src/utils";
import type { StepItem } from "src/utils/uiComponentsTypes";

import { StyledSkeleton } from "components/StyledSkeleton";

const Timeline: React.FC<{
  dispute: DisputeDetailsQuery["dispute"];
  currentPeriodIndex: number;
}> = ({ currentPeriodIndex, dispute }) => {
  const currentItemIndex = currentPeriodToCurrentItem(currentPeriodIndex, dispute?.currentRound.hiddenVotes);
  const items = useTimeline(dispute, currentPeriodIndex);

  return (
    <Box className="w-full h-auto rounded-none bg-transparent">
      <Steps
        horizontal
        items={items as StepItem[]}
        currentItemIndex={currentItemIndex}
        className="flex justify-between w-[89%] m-auto [&_h2]:text-[calc(12px_+_(14_-_12)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] lg:w-[98%]"
      />
      {currentPeriodIndex === Periods.appeal ? <AppealBanner /> : null}
    </Box>
  );
};

const AppealBanner: React.FC = () => {
  const { loserSideCountdown, winnerSideCountdown } = useCountdownContext();
  const { fundedChoices } = useFundingContext();

  const { t } = useTranslation();
  const text = useMemo(() => {
    if (loserSideCountdown)
      return t("appeal.time_remaining_to_fund_losing", { time: secondsToDayHourMinute(loserSideCountdown) });
    // only show if loosing option was funded and winner needs funding, else no action is needed from user
    if (winnerSideCountdown && !isUndefined(fundedChoices) && fundedChoices.length > 0)
      return t("appeal.time_remaining_to_fund_winning", { time: secondsToDayHourMinute(winnerSideCountdown) });
    return;
  }, [loserSideCountdown, winnerSideCountdown, fundedChoices, t]);

  return text ? (
    <div className="bg-klerosUIComponentsWhiteBackground rounded-[3px] mt-4 p-3 flex gap-2 items-center justify-center [&_>_svg]:w-[14px] [&_>_svg]:fill-klerosUIComponentsSecondaryPurple">
      <HourglassIcon /> <small>{text}</small>
    </div>
  ) : null;
};

const currentPeriodToCurrentItem = (currentPeriodIndex: number, hiddenVotes?: boolean): number => {
  if (hiddenVotes) return currentPeriodIndex;
  if (currentPeriodIndex <= Periods.commit) return currentPeriodIndex;
  else return currentPeriodIndex - 1;
};

const useTimeline = (dispute: DisputeDetailsQuery["dispute"], currentPeriodIndex: number) => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const titles = [
    t("timeline.evidence"),
    t("timeline.commit"),
    t("timeline.voting"),
    t("timeline.appeal"),
    t("timeline.executed"),
  ];
  const periodTitles = [
    t("timeline.evidence_period"),
    t("timeline.commit_period"),
    t("timeline.voting_period"),
    t("timeline.appeal_period"),
    t("timeline.executed"),
  ];

  const deadlineCurrentPeriod = getDeadline(
    currentPeriodIndex,
    dispute?.lastPeriodChange,
    dispute?.currentRound.timesPerPeriod
  );

  const countdown = useCountdown(deadlineCurrentPeriod);
  const getSubitems = (index: number): string[] | React.ReactNode[] => {
    if (typeof countdown !== "undefined" && dispute) {
      if (index === titles.length - 1) {
        return [];
      } else if (index === currentPeriodIndex && countdown === 0) {
        return [t("voting.times_up")];
      } else if (index < currentPeriodIndex) {
        return [];
      } else if (index === currentPeriodIndex) {
        return [secondsToDayHourMinute(countdown)];
      } else {
        return [secondsToDayHourMinute(Number(dispute?.currentRound.timesPerPeriod[index]))];
      }
    }
    return [<StyledSkeleton key={index} width={60} />];
  };
  return titles.flatMap((title, i) => {
    // if not hidden votes, skip commit index
    if (!dispute?.currentRound.hiddenVotes && i === Periods.commit) return [];
    return [
      {
        title: i + 1 < titles.length && isDesktop ? periodTitles[i] : title,
        subitems: getSubitems(i),
      },
    ];
  });
};

export const getDeadline = (
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
