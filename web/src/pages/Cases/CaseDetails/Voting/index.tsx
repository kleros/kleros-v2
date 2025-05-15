import React, { useMemo, useState } from "react";
import styled, { css } from "styled-components";

import Skeleton from "react-loading-skeleton";
import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";

import VoteIcon from "svgs/icons/voted.svg";

import { Periods } from "consts/periods";
import { useLockOverlayScroll } from "hooks/useLockOverlayScroll";
import { useVotingContext } from "hooks/useVotingContext";
import { formatDate } from "utils/date";
import { isUndefined } from "utils/index";
import { isLastRound } from "utils/isLastRound";

import { useAppealCost } from "queries/useAppealCost";
import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import { responsiveSize } from "styles/responsiveSize";
import { landscapeStyle } from "styles/landscapeStyle";

import { getPeriodEndTimestamp } from "components/DisputeView";
import InfoCard from "components/InfoCard";
import Popup, { PopupType } from "components/Popup";

import Classic from "./Classic";
import Shutter from "./Shutter";
import VotingHistory from "./VotingHistory";

import { getDisputeKitName } from "consts/index";

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

const useFinalDate = (lastPeriodChange: string, currentPeriodIndex?: number, timesPerPeriod?: string[]) =>
  useMemo(() => {
    if (!isUndefined(currentPeriodIndex) && !isUndefined(timesPerPeriod))
      return getPeriodEndTimestamp(lastPeriodChange, currentPeriodIndex, timesPerPeriod);
    else return undefined;
  }, [lastPeriodChange, currentPeriodIndex, timesPerPeriod]);

interface IVoting {
  arbitrable?: `0x${string}`;
  currentPeriodIndex: number;
}

const Voting: React.FC<IVoting> = ({ arbitrable, currentPeriodIndex }) => {
  const { id } = useParams();
  const { isDisconnected } = useAccount();
  const { data: disputeData } = useDisputeDetailsQuery(id);
  const { data: appealCost } = useAppealCost(id);
  const { wasDrawn: userWasDrawn, hasVoted: voted, isLoading: isDrawDataLoading } = useVotingContext();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  useLockOverlayScroll(isPopupOpen);
  const lastPeriodChange = disputeData?.dispute?.lastPeriodChange;
  const timesPerPeriod = disputeData?.dispute?.court?.timesPerPeriod;
  const finalDate = useFinalDate(lastPeriodChange, currentPeriodIndex, timesPerPeriod);

  const disputeKitId = disputeData?.dispute?.currentRound?.disputeKit?.id;
  const disputeKitName = disputeKitId ? getDisputeKitName(Number(disputeKitId)) : undefined;
  const isClassicDisputeKit = disputeKitName?.toLowerCase().includes("classic") ?? false;
  const isShutterDisputeKit = disputeKitName?.toLowerCase().includes("shutter") ?? false;

  const isCommitOrVotePeriod = useMemo(
    () => [Periods.vote, Periods.commit].includes(currentPeriodIndex),
    [currentPeriodIndex]
  );

  return (
    <Container>
      {isLastRound(appealCost) && (
        <>
          <InfoCard msg="This dispute is on its last round. Vote wisely, It cannot be appealed any further." />
          <br />
        </>
      )}

      {userWasDrawn || isDisconnected ? null : (
        <InfoCardContainer>
          {isDrawDataLoading ? (
            <Skeleton width={300} height={20} />
          ) : (
            <InfoCard msg="You were not drawn in current round." />
          )}
        </InfoCardContainer>
      )}

      {isPopupOpen && (
        <Popup
          title="Thanks for Voting"
          icon={VoteIcon}
          popupType={
            disputeData?.dispute?.court?.hiddenVotes && currentPeriodIndex === Periods.commit
              ? PopupType.VOTE_WITH_COMMIT
              : PopupType.VOTE_WITHOUT_COMMIT
          }
          date={finalDate ? formatDate(finalDate) : ""}
          isCommit={false}
          setIsOpen={setIsPopupOpen}
        />
      )}
      {userWasDrawn && isCommitOrVotePeriod && !voted ? (
        <>
          <VotingHistory {...{ arbitrable }} isQuestion={false} />
          {isClassicDisputeKit ? <Classic arbitrable={arbitrable ?? "0x0"} setIsOpen={setIsPopupOpen} /> : null}
          {isShutterDisputeKit ? <Shutter arbitrable={arbitrable ?? "0x0"} setIsOpen={setIsPopupOpen} /> : null}
        </>
      ) : (
        <VotingHistory {...{ arbitrable }} isQuestion={true} />
      )}
    </Container>
  );
};

export default Voting;
