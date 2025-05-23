import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";

import { useDrawQuery } from "hooks/queries/useDrawQuery";
import { useVotingContext } from "hooks/useVotingContext";
import { DisputeDetailsQuery, useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import ShutterCommit from "./Commit";

interface IShutter {
  arbitrable: `0x${string}`;
  setIsOpen: (val: boolean) => void;
  dispute: DisputeDetailsQuery["dispute"];
  currentPeriodIndex: number;
}

const Shutter: React.FC<IShutter> = ({ arbitrable, setIsOpen, dispute, currentPeriodIndex }) => {
  const { id } = useParams();
  const { address } = useAccount();
  const { data: disputeData } = useDisputeDetailsQuery(id);
  const { data: drawData, refetch } = useDrawQuery(address?.toLowerCase(), id, disputeData?.dispute?.currentRound.id);
  const { isCommitPeriod, commited } = useVotingContext();
  const voteIDs = useMemo(() => drawData?.draws?.map((draw) => draw.voteIDNum) as string[], [drawData]);

  return id && isCommitPeriod && !commited ? (
    <ShutterCommit {...{ arbitrable, setIsOpen, voteIDs, refetch, dispute, currentPeriodIndex }} />
  ) : null;
};

export default Shutter;
