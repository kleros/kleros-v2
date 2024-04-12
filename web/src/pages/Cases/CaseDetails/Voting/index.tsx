import React, { useMemo, useState } from "react";
import styled from "styled-components";

import Skeleton from "react-loading-skeleton";
import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";

import VoteIcon from "assets/svgs/icons/voted.svg";

import { Periods } from "consts/periods";
import { useLockOverlayScroll } from "hooks/useLockOverlayScroll";
import { useVotingContext } from "hooks/useVotingContext";
import { formatDate } from "utils/date";
import { isUndefined } from "utils/index";
import { isLastRound } from "utils/isLastRound";

import { useAppealCost } from "queries/useAppealCost";
import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import { responsiveSize } from "styles/responsiveSize";

import { getPeriodEndTimestamp } from "components/DisputeView";
import InfoCard from "components/InfoCard";
import Popup, { PopupType } from "components/Popup";

import Classic from "./Classic";
import VotingHistory from "./VotingHistory";

const Container = styled.div`
  padding: ${responsiveSize(16, 32)};
  padding-bottom: ${responsiveSize(8, 16)};
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
        <>
          {isDrawDataLoading ? (
            <Skeleton width={300} height={20} />
          ) : (
            <InfoCard msg="You were not drawn in current round." />
          )}
          <br />
        </>
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
          <Classic arbitrable={arbitrable ?? "0x0"} setIsOpen={setIsPopupOpen} />
        </>
      ) : (
        <VotingHistory {...{ arbitrable }} isQuestion={true} />
      )}
    </Container>
  );
};

export default Voting;
