import React, { useMemo } from "react";

import { useParams } from "react-router-dom";
import type { Address } from "viem";
import { useAccount } from "wagmi";

import { useDrawQuery } from "hooks/queries/useDrawQuery";
import { useVotingContext } from "hooks/useVotingContext";
import type { Bytes32Hash } from "utils/crypto/hashVote";

import { DisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import ShutterCommit from "./Commit";
import Reveal from "./Reveal";

interface IShutter {
  arbitrable: Address;
  setIsOpen: (val: boolean) => void;
  dispute: DisputeDetailsQuery["dispute"];
  currentPeriodIndex: number;
  isGated: boolean;
}

const Shutter: React.FC<IShutter> = ({ arbitrable, setIsOpen, dispute, currentPeriodIndex, isGated }) => {
  const { id } = useParams();
  const { address } = useAccount();
  const { data: drawData } = useDrawQuery(address?.toLowerCase(), id, dispute?.currentRound.id);
  const { isCommitPeriod, isVotingPeriod, commit, commited } = useVotingContext();
  const voteIDs = useMemo(() => drawData?.draws?.map((draw) => draw.voteIDNum) as string[], [drawData]);

  const shouldShowCommit = id && isCommitPeriod && !commited;
  const shouldShowReveal = id && isVotingPeriod;

  return (
    <>
      {shouldShowCommit && (
        <ShutterCommit {...{ arbitrable, setIsOpen, voteIDs, dispute, currentPeriodIndex, isGated }} />
      )}
      {shouldShowReveal && <Reveal {...{ setIsOpen, voteIDs, isGated, arbitrable, commit: commit as Bytes32Hash }} />}
    </>
  );
};

export default Shutter;
