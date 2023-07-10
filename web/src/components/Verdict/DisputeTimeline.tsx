import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import styled, { useTheme } from "styled-components";
import { _TimelineItem1, CustomTimeline } from "@kleros/ui-components-library";
import { Periods } from "consts/periods";
import { useVotingHistory } from "queries/useVotingHistory";
import { useDisputeTemplate } from "queries/useDisputeTemplate";
import { DisputeDetailsQuery, useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";
import ClosedCaseIcon from "assets/svgs/icons/check-circle-outline.svg";
import AppealedCaseIcon from "assets/svgs/icons/close-circle.svg";
import CalendarIcon from "assets/svgs/icons/calendar.svg";

const Container = styled.div`
  display: flex;
  position: relative;
  margin-left: 8px;
`;

const StyledTimeline = styled(CustomTimeline)`
  width: 100%;
  margin-bottom: 32px;
`;

const EnforcementContainer = styled.div`
  position: absolute;
  bottom: 0;
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  fill: ${({ theme }) => theme.secondaryText};

  small {
    font-weight: 400;
    line-height: 19px;
    color: ${({ theme }) => theme.secondaryText};
  }
`;

const StyledCalendarIcon = styled(CalendarIcon)`
  width: 14px;
  height: 14px;
`;

const getCaseEventTimes = (
  lastPeriodChange: string,
  currentPeriodIndex: number,
  timesPerPeriod: string[],
  isCreation: boolean
) => {
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
  const durationCurrentPeriod = parseInt(timesPerPeriod[currentPeriodIndex - 1]);
  const startingDate = new Date(
    (parseInt(lastPeriodChange) + (isCreation ? -durationCurrentPeriod : durationCurrentPeriod)) * 1000
  );

  const formattedDate = startingDate.toLocaleDateString("en-US", options);
  return formattedDate;
};

type TimelineItems = [_TimelineItem1, ..._TimelineItem1[]];

const useItems = (disputeDetails?: DisputeDetailsQuery) => {
  const { data: disputeTemplate } = useDisputeTemplate();
  const { id } = useParams();
  const { data: votingHistory } = useVotingHistory(id);
  const localRounds = votingHistory?.dispute?.disputeKitDispute?.localRounds;
  const theme = useTheme();

  return useMemo<TimelineItems | undefined>(() => {
    const dispute = disputeDetails?.dispute;
    if (dispute) {
      const currentPeriodIndex = Periods[dispute.period];
      const lastPeriodChange = dispute.lastPeriodChange;
      const courtTimePeriods = dispute.court.timesPerPeriod;
      return localRounds?.reduce<TimelineItems>(
        (acc, { winningChoice }, index) => {
          const parsedWinningChoice = parseInt(winningChoice);
          const eventDate = getCaseEventTimes(lastPeriodChange, currentPeriodIndex, courtTimePeriods, false);
          const icon = disputeDetails?.dispute?.ruled && index === localRounds.length - 1 ? ClosedCaseIcon : "";

          acc.push({
            title: `Jury Decision - Round ${index + 1}`,
            party:
              parsedWinningChoice !== 0
                ? disputeTemplate?.answers?.[parseInt(winningChoice) - 1].title
                : "Refuse to Arbitrate",
            subtitle: eventDate,
            rightSided: true,
            variant: theme.secondaryPurple,
            Icon: icon !== "" ? icon : undefined,
          });

          if (index < localRounds.length - 1) {
            acc.push({
              title: "Appealed",
              party: "",
              subtitle: eventDate,
              rightSided: true,
              Icon: AppealedCaseIcon,
            });
          }

          return acc;
        },
        [
          {
            title: "Dispute created",
            party: "",
            subtitle: getCaseEventTimes(lastPeriodChange, currentPeriodIndex, courtTimePeriods, true),
            rightSided: true,
            variant: theme.secondaryPurple,
          },
        ]
      );
    }
    return;
  }, [disputeDetails, disputeTemplate, localRounds, theme]);
};

const DisputeTimeline: React.FC = () => {
  const { id } = useParams();
  const { data: disputeDetails } = useDisputeDetailsQuery(id);
  const items = useItems(disputeDetails);

  return (
    <Container>
      {items && <StyledTimeline {...{ items }} />}
      {disputeDetails?.dispute?.ruled && items && (
        <EnforcementContainer>
          <StyledCalendarIcon />
          <small>Enforcement: {items.at(-1)?.subtitle}</small>
        </EnforcementContainer>
      )}
    </Container>
  );
};
export default DisputeTimeline;
