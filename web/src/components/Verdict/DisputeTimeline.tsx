import React, { useMemo } from "react";
import styled, { useTheme } from "styled-components";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { _TimelineItem1, CustomTimeline } from "@kleros/ui-components-library";

import ClosedCaseIcon from "svgs/icons/check-circle-outline.svg";
import GavelExecutedIcon from "svgs/icons/gavel-executed.svg";
import NewTabIcon from "svgs/icons/new-tab.svg";

import { Periods } from "consts/periods";
import { usePopulatedDisputeData } from "hooks/queries/usePopulatedDisputeData";
import { getLocalRounds } from "utils/getLocalRounds";
import { getVoteChoice } from "utils/getVoteChoice";

import { DisputeDetailsQuery, useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";
import { useVotingHistory } from "queries/useVotingHistory";

import { ClassicRound } from "src/graphql/graphql";
import { getTxnExplorerLink } from "src/utils";

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
  const { t } = useTranslation();
  const { id } = useParams();
  const { data: votingHistory } = useVotingHistory(id);
  const { data: disputeData } = usePopulatedDisputeData(id, arbitrable);
  const localRounds: ClassicRound[] = getLocalRounds(votingHistory?.dispute?.disputeKitDispute) as ClassicRound[];
  const rounds = votingHistory?.dispute?.rounds;
  const theme = useTheme();
  const txnDisputeCreatedLink = useMemo(() => {
    return getTxnExplorerLink(votingHistory?.dispute?.transactionHash ?? "");
  }, [votingHistory]);
  const txnEnforcementLink = useMemo(() => {
    return getTxnExplorerLink(disputeDetails?.dispute?.rulingTransactionHash ?? "");
  }, [disputeDetails]);

  return useMemo<TimelineItems | undefined>(() => {
    const dispute = disputeDetails?.dispute;
    if (!dispute) return;

    const rulingOverride = dispute.overridden;
    const currentPeriodIndex = Periods[dispute.period];

    const base: TimelineItems = [
      {
        title: t("dispute_info.dispute_created"),
        party: (
          <ExternalLink to={txnDisputeCreatedLink} rel="noopener noreferrer" target="_blank">
            <StyledNewTabIcon />
          </ExternalLink>
        ),
        subtitle: formatDate(votingHistory?.dispute?.createdAt),
        rightSided: true,
        variant: theme.secondaryPurple,
      },
    ];

    const items = localRounds?.reduce<_TimelineItem1[]>((acc, { winningChoice }, index) => {
      const isOngoing = index === localRounds.length - 1 && currentPeriodIndex < 3;
      const roundTimeline = rounds?.[index].timeline;
      const icon = dispute.ruled && !rulingOverride && index === localRounds.length - 1 ? ClosedCaseIcon : undefined;
      const answers = disputeData?.answers;

      acc.push({
        title: `${t("dispute_info.jury_decision")} - ${t("dispute_info.round")} ${index + 1}`,
        party: isOngoing ? t("voting.voting_is_ongoing") : getVoteChoice(winningChoice, answers),
        subtitle: isOngoing ? "" : `${formatDate(roundTimeline?.[Periods.vote])} / ${rounds?.[index]?.court.name}`,
        rightSided: true,
        variant: theme.secondaryPurple,
        Icon: icon,
      });

      if (index < localRounds.length - 1) {
        acc.push({
          title: t("dispute_info.appealed"),
          party: "",
          subtitle: formatDate(roundTimeline?.[Periods.appeal]),
          rightSided: true,
          Icon: StyledClosedCircle,
        });
      } else if (rulingOverride && dispute.currentRuling !== winningChoice) {
        acc.push({
          title: t("dispute_info.won_by_appeal"),
          party: getVoteChoice(dispute.currentRuling, answers),
          subtitle: formatDate(roundTimeline?.[Periods.appeal]),
          rightSided: true,
          Icon: ClosedCaseIcon,
        });
      }

      return acc;
    }, []);

    if (dispute.ruled) {
      items.push({
        title: t("dispute_info.enforcement"),
        party: (
          <ExternalLink to={txnEnforcementLink} rel="noopener noreferrer" target="_blank">
            <StyledNewTabIcon />
          </ExternalLink>
        ),
        subtitle: `${formatDate(dispute.rulingTimestamp)} / ${rounds?.at(-1)?.court.name}`,
        rightSided: true,
        Icon: GavelExecutedIcon,
      });
    }

    return [...base, ...items] as TimelineItems;
  }, [
    disputeDetails,
    disputeData,
    localRounds,
    theme,
    rounds,
    votingHistory,
    txnDisputeCreatedLink,
    txnEnforcementLink,
  ]);
};

interface IDisputeTimeline {
  arbitrable?: `0x${string}`;
}

const DisputeTimeline: React.FC<IDisputeTimeline> = ({ arbitrable }) => {
  const { id } = useParams();
  const { data: disputeDetails } = useDisputeDetailsQuery(id);
  const items = useItems(disputeDetails, arbitrable);

  return <Container>{items && <StyledTimeline {...{ items }} />}</Container>;
};
export default DisputeTimeline;
