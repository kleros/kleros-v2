import React from "react";
import styled from "styled-components";
import { _TimelineItem1, CustomTimeline } from "@kleros/ui-components-library";
import { Periods } from "consts/periods";
import { useVotingHistory } from "queries/useVotingHistory";
import { DisputeDetailsQuery } from "queries/useDisputeDetailsQuery";
import { lightTheme } from "~src/styles/themes";
import ClosedCaseIcon from "assets/svgs/icons/check-circle-outline.svg";
import AppealedCaseIcon from "assets/svgs/icons/close-circle.svg";
import CalendarIcon from "assets/svgs/icons/calendar.svg";
import { isUndefined } from "utils/index";
const Container = styled.div`
  display: flex;
  position: relative;
  margin-left: 16px;
`;

const StyledTimeline = styled(CustomTimeline)`
  width: calc(200px + (350 - 200) * (100vw - 375px) / (1250 - 375));
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

interface IDisputeTimeline {
  id: string;
  disputeTemplate: any;
  disputeDetails: DisputeDetailsQuery;
}

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

const calculateLocalRoundJuror = (votes) => {
  const choiceCount = {};
  let maxVotes = 0;
  let winningChoice = null;

  votes.forEach((vote) => {
    const { choice } = vote;

    choiceCount[choice] = (choiceCount[choice] || 0) + 1;

    if (choiceCount[choice] > maxVotes) {
      maxVotes = choiceCount[choice];
      winningChoice = choice;
    }
  });

  return winningChoice;
};

const DisputeTimeline: React.FC<IDisputeTimeline> = ({ id, disputeTemplate, disputeDetails }) => {
  const { data: votingHistory } = useVotingHistory(id);
  const currentPeriodIndex = Periods[disputeDetails?.dispute?.period!];
  const lastPeriodChange = disputeDetails?.dispute?.lastPeriodChange;
  const courtTimePeriods = disputeDetails.dispute?.court.timesPerPeriod!;
  const rounds = votingHistory?.dispute?.rounds;
  const localRounds = votingHistory?.dispute?.disputeKitDispute?.localRounds;

  const dynamicItems: [_TimelineItem1, ..._TimelineItem1[]] = [
    {
      title: "Dispute created",
      party: "",
      subtitle: getCaseEventTimes(lastPeriodChange, currentPeriodIndex, courtTimePeriods, true),
      rightSided: true,
      variant: lightTheme.secondaryPurple,
    },
  ];

  if (rounds) {
    rounds.forEach((round, index) => {
      const localRuling = calculateLocalRoundJuror(!isUndefined(localRounds) && localRounds[index].votes);
      const eventDate = getCaseEventTimes(lastPeriodChange, currentPeriodIndex, courtTimePeriods, false);
      const variant = disputeDetails?.dispute?.ruled && index === rounds.length - 1 ? ClosedCaseIcon : "";

      dynamicItems.push({
        title: `Jury Decision - Round ${index + 1}`,
        party: localRuling ? disputeTemplate?.answers?.[localRuling - 1].title : "Refuse to Arbitrate",
        subtitle: eventDate,
        rightSided: true,
        variant: lightTheme.secondaryPurple,
        Icon: variant !== "" ? variant : undefined,
      });

      if (index < rounds.length - 1) {
        dynamicItems.push({
          title: "Appealed",
          party: "",
          subtitle: eventDate,
          rightSided: true,
          Icon: AppealedCaseIcon,
        });
      }
    });
  }
  return (
    <Container>
      <StyledTimeline items={dynamicItems} />
      {disputeDetails?.dispute?.ruled && (
        <EnforcementContainer>
          <StyledCalendarIcon />
          <small>Enforcement: {dynamicItems[dynamicItems.length - 1].subtitle}</small>
        </EnforcementContainer>
      )}
    </Container>
  );
};
export default DisputeTimeline;
