import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";

import { useDrawQuery } from "hooks/queries/useDrawQuery";
import { useVotingContext } from "hooks/useVotingContext";
import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import ShutterCommit from "./Commit";

interface IShutter {
  arbitrable: `0x${string}`;
  setIsOpen: (val: boolean) => void;
}

const Shutter: React.FC<IShutter> = ({ arbitrable, setIsOpen }) => {
  const { id } = useParams();
  const { address } = useAccount();
  const { data: disputeData } = useDisputeDetailsQuery(id);
  const { data: drawData, refetch } = useDrawQuery(address?.toLowerCase(), id, disputeData?.dispute?.currentRound.id);
  const { isCommitPeriod, commited } = useVotingContext();
  const voteIDs = useMemo(() => drawData?.draws?.map((draw) => draw.voteIDNum) as string[], [drawData]);

  return id && isCommitPeriod && !commited ? <ShutterCommit {...{ arbitrable, setIsOpen, voteIDs, refetch }} /> : null;
};

export default Shutter;
