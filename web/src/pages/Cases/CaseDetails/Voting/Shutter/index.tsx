import React, { useMemo } from "react";

import { useParams } from "react-router-dom";

import { useDrawQuery } from "hooks/queries/useDrawQuery";
import { useVotingContext } from "hooks/useVotingContext";

import { DisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import { useWallet } from "context/walletProviders";
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
  const { account } = useWallet();
  const { data: drawData, refetch } = useDrawQuery(account?.toLowerCase(), id, dispute?.currentRound.id);
  const { isCommitPeriod, isVotingPeriod, commited } = useVotingContext();
  const voteIDs = useMemo(() => drawData?.draws?.map((draw) => draw.voteIDNum) as string[], [drawData]);

  const shouldShowCommit = id && isCommitPeriod && !commited;
  const shouldShowReveal = id && isVotingPeriod;

  return (
    <>
      {shouldShowCommit && (
        <ShutterCommit {...{ arbitrable, setIsOpen, voteIDs, refetch, dispute, currentPeriodIndex, isGated }} />
      )}
      {shouldShowReveal && <Reveal {...{ setIsOpen, voteIDs, isGated }} />}
    </>
  );
};

export default Shutter;
