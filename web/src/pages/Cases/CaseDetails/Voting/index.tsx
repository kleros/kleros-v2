import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import { responsiveSize } from "styles/responsiveSize";
import VoteIcon from "assets/svgs/icons/voted.svg";
import { Periods } from "consts/periods";
import { useLockOverlayScroll } from "hooks/useLockOverlayScroll";
import { useDisputeKitClassicIsVoteActive } from "hooks/contracts/generated";
import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";
import { useDrawQuery } from "queries/useDrawQuery";
import { useAppealCost } from "queries/useAppealCost";
import { isUndefined } from "utils/index";
import { isLastRound } from "utils/isLastRound";
import { formatDate } from "utils/date";
import Popup, { PopupType } from "components/Popup";
import { getPeriodEndTimestamp } from "components/DisputeCard";
import InfoCard from "components/InfoCard";
import Classic from "./Classic";
import VotingHistory from "./VotingHistory";
import Skeleton from "react-loading-skeleton";

const Container = styled.div`
  padding: ${responsiveSize(16, 32)};
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
  const { address } = useAccount();
  const { id } = useParams();
  const { data: disputeData } = useDisputeDetailsQuery(id);
  const { data: appealCost } = useAppealCost(id);
  const { data: drawData, isLoading: isDrawDataLoading } = useDrawQuery(
    address?.toLowerCase(),
    id,
    disputeData?.dispute?.currentRound.id
  );
  const roundId = disputeData?.dispute?.currentRoundIndex;
  const voteId = drawData?.draws?.[0]?.voteIDNum;
  const { data: voted } = useDisputeKitClassicIsVoteActive({
    enabled: !isUndefined(roundId) && !isUndefined(voteId),
    args: [BigInt(id ?? 0), roundId, voteId],
    watch: true,
  });
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  useLockOverlayScroll(isPopupOpen);
  const lastPeriodChange = disputeData?.dispute?.lastPeriodChange;
  const timesPerPeriod = disputeData?.dispute?.court?.timesPerPeriod;
  const finalDate = useFinalDate(lastPeriodChange, currentPeriodIndex, timesPerPeriod);

  const userWasDrawn = useMemo(() => !isUndefined(drawData) && drawData.draws.length > 0, [drawData]);
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

      {userWasDrawn ? null : (
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
