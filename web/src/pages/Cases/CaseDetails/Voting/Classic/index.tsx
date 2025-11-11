import React, { useMemo } from "react";

import { useParams } from "react-router-dom";

import { useDrawQuery } from "hooks/queries/useDrawQuery";
import { useVotingContext } from "hooks/useVotingContext";

import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import { useWallet } from "context/walletProviders";
import Commit from "./Commit";
import Reveal from "./Reveal";
import Vote from "./Vote";

interface IClassic {
  arbitrable: `0x${string}`;
  setIsOpen: (val: boolean) => void;
  isGated: boolean;
}

const Classic: React.FC<IClassic> = ({ arbitrable, setIsOpen, isGated }) => {
  const { id } = useParams();
  const { account } = useWallet();
  const { data: disputeData } = useDisputeDetailsQuery(id);
  const { data: drawData, refetch } = useDrawQuery(account?.toLowerCase(), id, disputeData?.dispute?.currentRound.id);
  const { isHiddenVotes, isCommitPeriod, commit, commited } = useVotingContext();
  const voteIDs = useMemo(() => drawData?.draws?.map((draw) => draw.voteIDNum) as string[], [drawData]);

  return id && isHiddenVotes ? (
    isCommitPeriod && !commited ? (
      <Commit {...{ arbitrable, setIsOpen, voteIDs, refetch, isGated }} />
    ) : (
      <Reveal {...{ arbitrable, setIsOpen, voteIDs, commit: commit!, isRevealPeriod: !isCommitPeriod, isGated }} />
    )
  ) : (
    <Vote {...{ arbitrable, setIsOpen, voteIDs }} />
  );
};

export default Classic;
