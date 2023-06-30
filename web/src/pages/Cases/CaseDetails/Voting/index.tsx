import React from "react";
import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";
import { useDrawQuery } from "queries/useDrawQuery";
import Binary from "./Binary";
import VotingHistory from "./VotingHistory";
import { Periods } from "consts/periods";
import { isUndefined } from "utils/index";

const Voting: React.FC<{
  arbitrable?: `0x${string}`;
  currentPeriodIndex?: number;
}> = ({ arbitrable, currentPeriodIndex }) => {
  const { address } = useAccount();
  const { id } = useParams();
  const { data: disputeData } = useDisputeDetailsQuery(id);
  const { data } = useDrawQuery(address?.toLowerCase(), id, disputeData?.dispute?.currentRound.id);
  return data && !isUndefined(arbitrable) && currentPeriodIndex === Periods.vote && data.draws?.length > 0 ? (
    <Binary {...{ arbitrable }} voteIDs={data.draws.map((draw) => draw.voteID)} />
  ) : (
    <VotingHistory {...{ arbitrable }} />
  );
};

export default Voting;
