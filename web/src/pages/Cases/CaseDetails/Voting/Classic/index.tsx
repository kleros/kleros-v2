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
  voteIDs: string[];
  setIsOpen: (val: boolean) => void;
}

const Classic: React.FC<IClassic> = ({ arbitrable, setIsOpen }) => {
  const { id } = useParams();
  const { address } = useAccount();
  const { data: disputeData } = useDisputeDetailsQuery(id);
  const { data: drawData } = useDrawQuery(address?.toLowerCase(), id, disputeData?.dispute?.currentRound.id);
  const isCommitReveal = useMemo(() => disputeData?.dispute?.court.hiddenVotes, [disputeData]);
  const commited = useMemo(() => drawData?.draws[0].vote?.commited, [drawData]);
  const voteIDs = useMemo(() => drawData?.draws?.map((draw) => draw.voteIDNum) as string[], [drawData]);
  return id && isCommitReveal ? (
    !commited ? (
      <Commit {...{ arbitrable, setIsOpen, voteIDs }} />
    ) : (
      <Reveal {...{ arbitrable, setIsOpen, voteIDs }} />
    )
  ) : (
    <Vote {...{ arbitrable, setIsOpen, voteIDs }} />
  );
};

export default Classic;