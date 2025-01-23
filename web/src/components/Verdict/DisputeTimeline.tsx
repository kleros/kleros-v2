import React, { useMemo } from "react";
import styled, { useTheme } from "styled-components";

import Skeleton from "react-loading-skeleton";
import { useParams } from "react-router-dom";

import { _TimelineItem1, CustomTimeline } from "@kleros/ui-components-library";

import CalendarIcon from "svgs/icons/calendar.svg";
import ClosedCaseIcon from "svgs/icons/check-circle-outline.svg";
import NewTabIcon from "svgs/icons/new-tab.svg";

import { Periods } from "consts/periods";
import { usePopulatedDisputeData } from "hooks/queries/usePopulatedDisputeData";
import { getLocalRounds } from "utils/getLocalRounds";
import { getVoteChoice } from "utils/getVoteChoice";

import { DisputeDetailsQuery, useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";
import { useVotingHistory } from "queries/useVotingHistory";

import { ClassicRound } from "src/graphql/graphql";
import { getTxnExplorerLink } from "src/utils";

import { responsiveSize } from "styles/responsiveSize";

import { StyledClosedCircle } from "components/StyledIcons/ClosedCircleIcon";

import { ExternalLink } from "../ExternalLink";

const Container = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
`;

const StyledTimeline = styled(CustomTimeline)`
  width: 100%;
`;

const EnforcementContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-top: ${responsiveSize(12, 24)};
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

const StyledNewTabIcon = styled(NewTabIcon)`
  margin-bottom: 2px;
  path {
    fill: ${({ theme }) => theme.primaryBlue};
  }
  :hover {
    path {
      fill: ${({ theme }) => theme.secondaryBlue};
    }
  }
`;

const formatDate = (date: string) => {
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
  const startingDate = new Date(parseInt(date) * 1000);

  const formattedDate = startingDate.toLocaleDateString("en-US", options);
  return formattedDate;
};

type TimelineItems = [_TimelineItem1, ..._TimelineItem1[]];

const useItems = (disputeDetails?: DisputeDetailsQuery, arbitrable?: `0x${string}`) => {
  const { id } = useParams();
  const { data: votingHistory } = useVotingHistory(id);
  const { data: disputeData } = usePopulatedDisputeData(id, arbitrable);
  const localRounds: ClassicRound[] = getLocalRounds(votingHistory?.dispute?.disputeKitDispute) as ClassicRound[];
  const rounds = votingHistory?.dispute?.rounds;
  const theme = useTheme();
  const txnExplorerLink = useMemo(() => {
    return getTxnExplorerLink(votingHistory?.dispute?.transactionHash ?? "");
  }, [votingHistory]);

  return useMemo<TimelineItems | undefined>(() => {
    const dispute = disputeDetails?.dispute;
    if (dispute) {
      const rulingOverride = dispute.overridden;
      const currentPeriodIndex = Periods[dispute.period];

      return localRounds?.reduce<TimelineItems>(
        (acc, { winningChoice }, index) => {
          const isOngoing = index === localRounds.length - 1 && currentPeriodIndex < 3;
          const roundTimeline = rounds?.[index].timeline;

          const icon = dispute.ruled && !rulingOverride && index === localRounds.length - 1 ? ClosedCaseIcon : "";
          const answers = disputeData?.answers;
          acc.push({
            title: `Jury Decision - Round ${index + 1}`,
            party: isOngoing ? "Voting is ongoing" : getVoteChoice(winningChoice, answers),
            subtitle: isOngoing
              ? ""
              : `${formatDate(roundTimeline?.[Periods.vote])} / ${
                  votingHistory?.dispute?.rounds.at(index)?.court.name
                }`,
            rightSided: true,
            variant: theme.secondaryPurple,
            Icon: icon !== "" ? icon : undefined,
          });

          if (index < localRounds.length - 1) {
            acc.push({
              title: "Appealed",
              party: "",
              subtitle: formatDate(roundTimeline?.[Periods.appeal]),
              rightSided: true,
              Icon: StyledClosedCircle,
            });
          } else if (rulingOverride && dispute.currentRuling !== winningChoice) {
            acc.push({
              title: "Won by Appeal",
              party: getVoteChoice(dispute.currentRuling, answers),
              subtitle: formatDate(roundTimeline?.[Periods.appeal]),
              rightSided: true,
              Icon: ClosedCaseIcon,
            });
          }

          return acc;
        },
        [
          {
            title: "Dispute created",
            party: (
              <ExternalLink to={txnExplorerLink} rel="noopener noreferrer" target="_blank">
                <StyledNewTabIcon />
              </ExternalLink>
            ),
            subtitle: formatDate(votingHistory?.dispute?.createdAt),
            rightSided: true,
            variant: theme.secondaryPurple,
          },
        ]
      );
    }
    return;
  }, [disputeDetails, disputeData, localRounds, theme, rounds, votingHistory, txnExplorerLink]);
};

interface IDisputeTimeline {
  arbitrable?: `0x${string}`;
}

const DisputeTimeline: React.FC<IDisputeTimeline> = ({ arbitrable }) => {
  const { id } = useParams();
  const { data: disputeDetails } = useDisputeDetailsQuery(id);
  const { data: votingHistory } = useVotingHistory(id);
  const items = useItems(disputeDetails, arbitrable);

  const transactionExplorerLink = useMemo(() => {
    return getTxnExplorerLink(disputeDetails?.dispute?.rulingTransactionHash ?? "");
  }, [disputeDetails]);

  return (
    <Container>
      {items && <StyledTimeline {...{ items }} />}
      {disputeDetails?.dispute?.ruled && (
        <EnforcementContainer>
          <StyledCalendarIcon />
          <small>
            Enforcement:{" "}
            {disputeDetails.dispute.rulingTimestamp ? (
              <ExternalLink to={transactionExplorerLink} rel="noopener noreferrer" target="_blank">
                {formatDate(disputeDetails.dispute.rulingTimestamp)}
              </ExternalLink>
            ) : (
              <Skeleton height={16} width={56} />
            )}{" "}
            / {votingHistory?.dispute?.rounds.at(-1)?.court.name}
          </small>
        </EnforcementContainer>
      )}
    </Container>
  );
};
export default DisputeTimeline;
