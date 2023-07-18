import React from "react";
import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";
import { useDrawQuery } from "queries/useDrawQuery";
import Classic from "./Classic";
import VotingHistory from "./VotingHistory";
import { Periods } from "consts/periods";
import { isUndefined } from "utils/index";
import { useDisputeKitClassicIsVoteActive } from "hooks/contracts/generated";

const Voting: React.FC<{
  arbitrable?: `0x${string}`;
  currentPeriodIndex?: number;
}> = ({ arbitrable, currentPeriodIndex }) => {
  const { address } = useAccount();
  const { id } = useParams();
  const { data: disputeData } = useDisputeDetailsQuery(id);
  const { data: drawData } = useDrawQuery(address?.toLowerCase(), id, disputeData?.dispute?.currentRound.id);
  const roundId = disputeData?.dispute?.currentRoundIndex;
  const voteId = drawData?.draws?.[0]?.voteID;
  const { data: voted } = useDisputeKitClassicIsVoteActive({
    enabled: !isUndefined(roundId) && !isUndefined(voteId),
    args: [BigInt(id ?? 0), roundId, voteId],
    watch: true,
  });
  return drawData &&
    !isUndefined(arbitrable) &&
    currentPeriodIndex === Periods.vote &&
    drawData.draws?.length > 0 &&
    !voted ? (
    <Classic {...{ arbitrable }} voteIDs={drawData.draws.map((draw) => draw.voteID)} />
  ) : (
    <VotingHistory {...{ arbitrable }} />
  );
};

export default Voting;
