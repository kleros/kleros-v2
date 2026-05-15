import React, { useMemo } from "react";
import styled, { useTheme } from "styled-components";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Address, Hash } from "viem";

import { CustomTimeline } from "@kleros/ui-components-library";

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
import { getTxnExplorerLink, isUndefined } from "src/utils";
import type { CustomTimelineItem } from "src/utils/uiComponentsTypes";

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

type TimelineItems = [CustomTimelineItem, ...CustomTimelineItem[]];

const useItems = (disputeDetails?: DisputeDetailsQuery, arbitrable?: Address) => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const { data: votingHistory } = useVotingHistory(id);
  const { data: disputeData } = usePopulatedDisputeData(id, arbitrable);
  const localRounds: ClassicRound[] = getLocalRounds(votingHistory?.dispute?.disputeKitDispute) as ClassicRound[];
  const rounds = votingHistory?.dispute?.rounds;
  const theme = useTheme();
  const txnDisputeCreatedLink = useMemo(() => {
    if (isUndefined(votingHistory?.dispute?.transactionHash)) return undefined;
    return getTxnExplorerLink(votingHistory?.dispute?.transactionHash as Hash);
  }, [votingHistory]);
  const txnEnforcementLink = useMemo(() => {
    if (isUndefined(disputeDetails?.dispute?.rulingTransactionHash)) return undefined;
    return getTxnExplorerLink(disputeDetails?.dispute?.rulingTransactionHash as Hash);
  }, [disputeDetails]);

  return useMemo<TimelineItems | undefined>(() => {
    const formatDate = (date?: string | null) => {
      if (!date) return "";
      const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
      const startingDate = new Date(parseInt(date) * 1000);
      return startingDate.toLocaleDateString(i18n.language, options);
    };

    const dispute = disputeDetails?.dispute;
    if (!dispute) return;

    const rulingOverride = dispute.overridden;
    const currentPeriodIndex = Periods[dispute.period];

    const base: TimelineItems = [
      {
        title: t("dispute_info.dispute_created"),
        party: txnDisputeCreatedLink ? (
          <ExternalLink to={txnDisputeCreatedLink} rel="noopener noreferrer" target="_blank">
            <StyledNewTabIcon />
          </ExternalLink>
        ) : (
          ""
        ),
        subtitle: formatDate(votingHistory?.dispute?.createdAt),
        variant: theme.secondaryPurple,
      },
    ];

    const items = localRounds?.reduce<CustomTimelineItem[]>((acc, { winningChoice }, index) => {
      const isOngoing = index === localRounds.length - 1 && currentPeriodIndex < 3;
      const roundTimeline = rounds?.[index].timeline;
      const icon = dispute.ruled && !rulingOverride && index === localRounds.length - 1 ? ClosedCaseIcon : undefined;
      const answers = disputeData?.answers ?? [];

      acc.push({
        title: t("dispute_info.jury_decision_round", { round: index + 1 }),
        party: isOngoing ? t("voting.voting_is_ongoing") : getVoteChoice(winningChoice, answers),
        subtitle: isOngoing ? "" : `${formatDate(roundTimeline?.[Periods.vote])} / ${rounds?.[index]?.court.name}`,
        variant: theme.secondaryPurple,
        Icon: icon,
      });

      if (index < localRounds.length - 1) {
        acc.push({
          title: t("dispute_info.appealed"),
          party: "",
          subtitle: formatDate(roundTimeline?.[Periods.appeal]),
          Icon: StyledClosedCircle,
        });
      } else if (rulingOverride && dispute.currentRuling !== winningChoice) {
        acc.push({
          title: t("dispute_info.won_by_appeal"),
          party: getVoteChoice(dispute.currentRuling, answers),
          subtitle: formatDate(roundTimeline?.[Periods.appeal]),
          Icon: ClosedCaseIcon,
        });
      }

      return acc;
    }, []);

    if (dispute.ruled) {
      items.push({
        title: t("dispute_info.enforcement"),
        party: txnEnforcementLink ? (
          <ExternalLink to={txnEnforcementLink} rel="noopener noreferrer" target="_blank">
            <StyledNewTabIcon />
          </ExternalLink>
        ) : (
          ""
        ),
        subtitle: `${formatDate(dispute.rulingTimestamp)} / ${rounds?.at(-1)?.court.name}`,
        Icon: GavelExecutedIcon,
      });
    }

    return [...base, ...items] as TimelineItems;
  }, [
    disputeDetails?.dispute,
    t,
    txnDisputeCreatedLink,
    i18n.language,
    votingHistory?.dispute?.createdAt,
    theme.secondaryPurple,
    localRounds,
    rounds,
    disputeData?.answers,
    txnEnforcementLink,
  ]);
};

interface IDisputeTimeline {
  arbitrable?: Address;
}

const DisputeTimeline: React.FC<IDisputeTimeline> = ({ arbitrable }) => {
  const { id } = useParams();
  const { data: disputeDetails } = useDisputeDetailsQuery(id);
  const items = useItems(disputeDetails, arbitrable);

  return <Container>{items && <StyledTimeline {...{ items }} />}</Container>;
};
export default DisputeTimeline;
