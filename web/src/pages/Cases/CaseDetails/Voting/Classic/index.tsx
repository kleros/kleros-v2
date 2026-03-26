import React, { useMemo } from "react";

import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";

import { useDrawQuery } from "hooks/queries/useDrawQuery";
import { useVotingContext } from "hooks/useVotingContext";

import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import { DisputeKitVotingProps } from "src/dispute-kits";

import Commit from "./Commit";
import Reveal from "./Reveal";
import Vote from "./Vote";
import { Bytes32Hash } from "utils/crypto/hashVote";

const Classic: React.FC<DisputeKitVotingProps> = ({ arbitrable, setIsOpen, disputeKitId }) => {
  const { id } = useParams();
  const { address } = useAccount();
  const { data: disputeData } = useDisputeDetailsQuery(id);
  const { data: drawData } = useDrawQuery(address?.toLowerCase(), id, disputeData?.dispute?.currentRound.id);
  const { isHiddenVotes, isCommitPeriod, commit, commited } = useVotingContext();
  const voteIDs = useMemo(() => drawData?.draws?.map((draw) => draw.voteIDNum) as string[], [drawData]);

  return id && isHiddenVotes ? (
    isCommitPeriod && !commited ? (
      <Commit {...{ arbitrable, setIsOpen, voteIDs, disputeKitId }} />
    ) : (
      <Reveal
        {...{
          arbitrable,
          setIsOpen,
          voteIDs,
          isRevealPeriod: !isCommitPeriod,
          disputeKitId,
          commit: commit as Bytes32Hash,
        }}
      />
    )
  ) : (
    <Vote {...{ arbitrable, setIsOpen, voteIDs, disputeKitId }} />
  );
};

export default Classic;
