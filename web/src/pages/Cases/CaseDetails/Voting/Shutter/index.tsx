import React, { useMemo } from "react";

import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";

import { useDrawQuery } from "hooks/queries/useDrawQuery";
import { useVotingContext } from "hooks/useVotingContext";

import { DisputeKitVotingProps } from "src/dispute-kits";

import ShutterCommit from "./Commit";
import Reveal from "./Reveal";

const Shutter: React.FC<DisputeKitVotingProps> = ({
  arbitrable,
  setIsOpen,
  dispute,
  currentPeriodIndex,
  disputeKitId,
}) => {
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
        <ShutterCommit {...{ arbitrable, setIsOpen, voteIDs, dispute, currentPeriodIndex, disputeKitId }} />
      )}
      {shouldShowReveal && <Reveal {...{ setIsOpen, voteIDs, disputeKitId, arbitrable, commit }} />}
    </>
  );
};

export default Shutter;
