import React, { useMemo } from "react";

import { useParams } from "react-router-dom";
import type { Address } from "viem";
import { useAccount } from "wagmi";

import { DisputeKits } from "consts/index";
import { useDrawQuery } from "hooks/queries/useDrawQuery";
import { useVotingContext } from "hooks/useVotingContext";
import type { Bytes32Hash } from "utils/crypto/hashVote";

import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import Commit from "./Commit";
import Reveal from "./Reveal";
import Vote from "./Vote";

interface IClassic {
  arbitrable: Address;
  setIsOpen: (val: boolean) => void;
  isGated: boolean;
  disputeKitName?: DisputeKits;
}

const Classic: React.FC<IClassic> = ({ arbitrable, setIsOpen, isGated, disputeKitName }) => {
  const { id } = useParams();
  const { address } = useAccount();
  const { data: disputeData } = useDisputeDetailsQuery(id);
  const { data: drawData } = useDrawQuery(address?.toLowerCase(), id, disputeData?.dispute?.currentRound.id);
  const { isHiddenVotes, isCommitPeriod, commit, commited } = useVotingContext();
  const voteIDs = useMemo(() => drawData?.draws?.map((draw) => draw.voteIDNum) as string[], [drawData]);

  return id && isHiddenVotes ? (
    isCommitPeriod && !commited ? (
      <Commit {...{ arbitrable, setIsOpen, voteIDs, isGated, disputeKitName }} />
    ) : (
      <Reveal
        {...{
          arbitrable,
          setIsOpen,
          voteIDs,
          isRevealPeriod: !isCommitPeriod,
          isGated,
          disputeKitName,
          commit: commit as Bytes32Hash,
        }}
      />
    )
  ) : (
    <Vote {...{ arbitrable, setIsOpen, voteIDs, isGated, disputeKitName }} />
  );
};

export default Classic;
