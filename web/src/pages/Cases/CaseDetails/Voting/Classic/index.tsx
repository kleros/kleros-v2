import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";
import { useDrawQuery } from "hooks/queries/useDrawQuery";
import Vote from "./Vote";
import Commit from "./Commit";
import Reveal from "./Reveal";

interface IClassic {
  arbitrable: `0x${string}`;
  setIsOpen: (val: boolean) => void;
}

const Classic: React.FC<IClassic> = ({ arbitrable, setIsOpen }) => {
  const { id } = useParams();
  const { address } = useAccount();
  const { data: disputeData } = useDisputeDetailsQuery(id);
  const { data: drawData, refetch } = useDrawQuery(address?.toLowerCase(), id, disputeData?.dispute?.currentRound.id);
  const isHiddenVotes = useMemo(() => disputeData?.dispute?.court.hiddenVotes, [disputeData]);
  const isCommitPeriod = useMemo(() => disputeData?.dispute?.period === "commit", [disputeData]);
  const commited = useMemo(() => drawData?.draws[0].vote?.commited, [drawData]);
  const commit = useMemo(() => drawData?.draws[0].vote?.commit, [drawData]);
  const voteIDs = useMemo(() => drawData?.draws?.map((draw) => draw.voteIDNum) as string[], [drawData]);
  return id && isHiddenVotes ? (
    isCommitPeriod && !commited ? (
      <Commit {...{ arbitrable, setIsOpen, voteIDs, refetch }} />
    ) : (
      <Reveal {...{ arbitrable, setIsOpen, voteIDs, commit, isRevealPeriod: !isCommitPeriod }} />
    )
  ) : (
    <Vote {...{ arbitrable, setIsOpen, voteIDs }} />
  );
};

export default Classic;
