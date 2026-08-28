import React, { useMemo, useState } from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";
import { useParams } from "react-router-dom";
import type { Address } from "viem";
import { useAccount } from "wagmi";

import VoteIcon from "svgs/icons/voted.svg";

import { Periods } from "consts/periods";
import { useDisputeKitInfo } from "hooks/useDisputeKitInfo";
import { useLockOverlayScroll } from "hooks/useLockOverlayScroll";
import { useVotingContext } from "hooks/useVotingContext";
import { formatDate } from "utils/date";
import { isUndefined } from "utils/index";
import { isLastRound } from "utils/isLastRound";

import { useAppealCost } from "queries/useAppealCost";
import { DisputeDetailsQuery, useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import { getPeriodEndTimestamp } from "components/DisputeView";
import InfoCard from "components/InfoCard";
import Popup, { PopupType } from "components/Popup";

import VotingHistory from "./VotingHistory";

const Container = styled.div`
  padding: 20px 16px 16px;

  ${landscapeStyle(
    () => css`
      padding: 32px 32px 16px;
    `
  )}
`;

const InfoCardContainer = styled.div`
  display: flex;
  margin-bottom: ${responsiveSize(16, 24)};
`;

const useFinalDate = (lastPeriodChange?: string, currentPeriodIndex?: number, timesPerPeriod?: string[]) =>
  useMemo(() => {
    if (!isUndefined(lastPeriodChange) && !isUndefined(currentPeriodIndex) && !isUndefined(timesPerPeriod))
      return getPeriodEndTimestamp(lastPeriodChange, currentPeriodIndex, timesPerPeriod);
    else return undefined;
  }, [lastPeriodChange, currentPeriodIndex, timesPerPeriod]);

interface IVoting {
  arbitrable?: Address;
  currentPeriodIndex: number;
  dispute: DisputeDetailsQuery["dispute"];
}

const Voting: React.FC<IVoting> = ({ arbitrable, currentPeriodIndex, dispute }) => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const { isDisconnected } = useAccount();
  const { data: disputeData } = useDisputeDetailsQuery(id);
  const { data: appealCost } = useAppealCost(id);
  const { wasDrawn: userWasDrawn, hasVoted: voted, isLoading: isDrawDataLoading } = useVotingContext();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  useLockOverlayScroll(isPopupOpen);
  const lastPeriodChange = disputeData?.dispute?.lastPeriodChange;
  const timesPerPeriod = disputeData?.dispute?.currentRound.timesPerPeriod;
  const finalDate = useFinalDate(lastPeriodChange, currentPeriodIndex, timesPerPeriod);

  const isCommitOrVotePeriod = useMemo(
    () => [Periods.vote, Periods.commit].includes(currentPeriodIndex),
    [currentPeriodIndex]
  );

  const disputeKitAddress = disputeData?.dispute?.currentRound?.disputeKit?.address ?? undefined;
  const disputeKitInfo = useDisputeKitInfo({ disputeKitAddress });

  if (isUndefined(disputeKitInfo)) {
    return (
      <Container>
        {isUndefined(disputeKitAddress) ? (
          <Skeleton height={200} />
        ) : (
          <InfoCard msg={t("alerts.unsupported_dispute_kit")} />
        )}
      </Container>
    );
  }

  const VotingComponent = disputeKitInfo.VotingComponent;
  return (
    <Container>
      {isLastRound(appealCost) && (
        <>
          <InfoCard msg={t("alerts.dispute_last_round")} />
          <br />
        </>
      )}

      {userWasDrawn || isDisconnected ? null : (
        <InfoCardContainer>
          {isDrawDataLoading ? (
            <Skeleton width={300} height={20} />
          ) : (
            <InfoCard msg={t("alerts.not_drawn_current_round")} />
          )}
        </InfoCardContainer>
      )}

      {isPopupOpen && (
        <Popup
          title={t("popups.thanks_for_voting")}
          icon={VoteIcon}
          popupType={
            disputeData?.dispute?.currentRound?.hiddenVotes && currentPeriodIndex === Periods.commit
              ? PopupType.VOTE_WITH_COMMIT
              : PopupType.VOTE_WITHOUT_COMMIT
          }
          date={finalDate ? formatDate(finalDate, false, i18n.language) : ""}
          isCommit={false}
          setIsOpen={setIsPopupOpen}
          automaticVoteReveal={disputeKitInfo.hasAutomaticVoteReveal}
        />
      )}
      {userWasDrawn && isCommitOrVotePeriod && !voted && !isUndefined(arbitrable) ? (
        <>
          <VotingHistory {...{ arbitrable }} isQuestion={false} />
          <VotingComponent
            arbitrable={arbitrable}
            setIsOpen={setIsPopupOpen}
            disputeKitId={disputeKitInfo.id}
            {...{ dispute, currentPeriodIndex }}
          />
        </>
      ) : (
        <VotingHistory {...{ arbitrable }} isQuestion={true} />
      )}
    </Container>
  );
};

export default Voting;
