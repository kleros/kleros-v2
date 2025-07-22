import React, { useMemo } from "react";

import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";

import { useDrawQuery } from "hooks/queries/useDrawQuery";
import { useVotingContext } from "hooks/useVotingContext";

import { DisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import ShutterCommit from "./Commit";
import Reveal from "./Reveal";

interface IShutter {
  arbitrable: `0x${string}`;
  setIsOpen: (val: boolean) => void;
  dispute: DisputeDetailsQuery["dispute"];
  currentPeriodIndex: number;
  isGated: boolean;
}

const Shutter: React.FC<IShutter> = ({ arbitrable, setIsOpen, dispute, currentPeriodIndex, isGated }) => {
  const { id } = useParams();
  const { address } = useAccount();
  const { data: drawData, refetch } = useDrawQuery(address?.toLowerCase(), id, dispute?.currentRound.id);
  const { isCommitPeriod, isVotingPeriod, commited } = useVotingContext();
  const voteIDs = useMemo(() => drawData?.draws?.map((draw) => draw.voteIDNum) as string[], [drawData]);

  return id && isCommitPeriod && !commited ? (
    <ShutterCommit {...{ arbitrable, setIsOpen, voteIDs, refetch, dispute, currentPeriodIndex, isGated }} />
  ) : id && isVotingPeriod ? (
    <Reveal {...{ setIsOpen, voteIDs }} />
  ) : null;
};

export default Shutter;
