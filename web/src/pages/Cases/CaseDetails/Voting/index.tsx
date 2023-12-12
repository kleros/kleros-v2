import React, { useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import { useLockOverlayScroll } from "hooks/useLockOverlayScroll";
import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";
import { useDrawQuery } from "queries/useDrawQuery";
import { useAppealCost } from "queries/useAppealCost";
import Classic from "./Classic";
import VotingHistory from "./VotingHistory";
import Popup, { PopupType } from "components/Popup";
import { Periods } from "consts/periods";
import { isUndefined } from "utils/index";
import { isLastRound } from "utils/isLastRound";
import { getPeriodEndTimestamp } from "components/DisputeCard";
import { useDisputeKitClassicIsVoteActive } from "hooks/contracts/generated";
import VoteIcon from "assets/svgs/icons/voted.svg";
import InfoCircle from "tsx:svgs/icons/info-circle.svg";
import { responsiveSize } from "styles/responsiveSize";

const Container = styled.div`
  padding: ${responsiveSize(16, 32)};
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: row;
  color: ${({ theme }) => theme.secondaryText};
  align-items: center;
  gap: ${responsiveSize(4, 8, 300)};

  svg {
    min-width: 16px;
    min-height: 16px;
  }
`;

function formatDate(unixTimestamp: number): string {
  const date = new Date(unixTimestamp * 1000);
  const options: Intl.DateTimeFormatOptions = { month: "long", day: "2-digit", year: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

interface IVoting {
  arbitrable?: `0x${string}`;
  currentPeriodIndex?: number;
}

const Voting: React.FC<IVoting> = ({ arbitrable, currentPeriodIndex }) => {
  const { address } = useAccount();
  const { id } = useParams();
  const { data: disputeData } = useDisputeDetailsQuery(id);
  const { data: appealCost } = useAppealCost(id);
  const { data: drawData } = useDrawQuery(address?.toLowerCase(), id, disputeData?.dispute?.currentRound.id);
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
  const finalDate =
    !isUndefined(currentPeriodIndex) &&
    !isUndefined(timesPerPeriod) &&
    getPeriodEndTimestamp(lastPeriodChange, currentPeriodIndex, timesPerPeriod);

  return (
    <Container>
      {!isUndefined(appealCost) && isLastRound(appealCost) && (
        <>
          <InfoContainer>
            <InfoCircle />
            This dispute is on its last round. Vote wisely, It cannot be appealed any further.
          </InfoContainer>
          <br></br>
        </>
      )}
      {drawData?.draws.length === 0 && (
        <>
          <InfoContainer>
            <InfoCircle />
            You were not drawn in current round.
          </InfoContainer>
          <br></br>
        </>
      )}

      {isPopupOpen && (
        <Popup
          title="Thanks for Voting"
          icon={VoteIcon}
          popupType={disputeData?.court?.hiddenVotes ? PopupType.VOTE_WITH_COMMIT : PopupType.VOTE_WITHOUT_COMMIT}
          date={finalDate ? formatDate(finalDate) : ""}
          isCommit={false}
          setIsOpen={setIsPopupOpen}
        />
      )}
      {drawData &&
      !isUndefined(arbitrable) &&
      currentPeriodIndex === Periods.vote &&
      drawData.draws?.length > 0 &&
      !voted ? (
        <>
          <VotingHistory {...{ arbitrable }} isQuestion={false} />
          <Classic
            {...{ arbitrable }}
            setIsOpen={setIsPopupOpen}
            voteIDs={drawData.draws.map((draw) => draw.voteIDNum)}
          />
        </>
      ) : (
        <VotingHistory {...{ arbitrable }} isQuestion={true} />
      )}
    </Container>
  );
};

export default Voting;
