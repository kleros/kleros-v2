import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import styled, { useTheme } from "styled-components";
import { _TimelineItem1, CustomTimeline } from "@kleros/ui-components-library";
import { Periods } from "consts/periods";
import { useKlerosCoreCurrentRuling } from "hooks/contracts/generated";
import { ClassicRound } from "~src/graphql/graphql";
import { DisputeDetailsQuery, useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";
import { useDisputeTemplate } from "queries/useDisputeTemplate";
import { useVotingHistory } from "queries/useVotingHistory";
import CalendarIcon from "assets/svgs/icons/calendar.svg";
import ClosedCaseIcon from "assets/svgs/icons/check-circle-outline.svg";
import AppealedCaseIcon from "assets/svgs/icons/close-circle.svg";

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

const useItems = (disputeDetails?: DisputeDetailsQuery, arbitrable?: `0x${string}`) => {
  const { id } = useParams();
  const { data: votingHistory } = useVotingHistory(id);
  const { data: disputeTemplate } = useDisputeTemplate(id, arbitrable);
  const { data: currentRulingArray } = useKlerosCoreCurrentRuling({ args: [BigInt(id ?? 0)], watch: true });
  const rulingOverride = currentRulingArray?.[2];
  const localRounds: ClassicRound[] = votingHistory?.dispute?.disputeKitDispute?.localRounds;
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
          const icon =
            disputeDetails?.dispute?.ruled && !rulingOverride && index === localRounds.length - 1 ? ClosedCaseIcon : "";

          acc.push({
            title: `Jury Decision - Round ${index + 1}`,
            party:
              parsedWinningChoice !== 0
                ? disputeTemplate?.answers?.[parsedWinningChoice - 1].title
                : "Refuse to Arbitrate",
            subtitle: eventDate,
            rightSided: true,
            variant: theme.secondaryPurple,
            Icon: icon !== "" ? icon : undefined,
          });

          if (index < localRounds.length - 1 || rulingOverride) {
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

interface IDisputeTimeline {
  arbitrable?: `0x${string}`;
}

const DisputeTimeline: React.FC<IDisputeTimeline> = ({ arbitrable }) => {
  const { id } = useParams();
  const { data: disputeDetails } = useDisputeDetailsQuery(id);
  const items = useItems(disputeDetails, arbitrable);

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
