import React, { useContext, createContext, useMemo } from "react";

import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";

import { isUndefined } from "utils/index";

import { useDisputeKitClassicIsVoteActive } from "./contracts/generated";
import { useDisputeDetailsQuery } from "./queries/useDisputeDetailsQuery";
import { useDrawQuery } from "./queries/useDrawQuery";

interface IVotingContext {
  wasDrawn: boolean;
  hasVoted: boolean | undefined;
  isLoading: boolean;
  isHiddenVotes: boolean;
  isCommitPeriod: boolean;
  isVotingPeriod: boolean;
  commited?: boolean;
  commit?: string;
}

const VotingContext = createContext<IVotingContext>({
  wasDrawn: false,
  hasVoted: false,
  isLoading: false,
  isHiddenVotes: false,
  isCommitPeriod: false,
  isVotingPeriod: false,
});
export const VotingContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { id } = useParams();
  const { address } = useAccount();
  const { data: disputeData } = useDisputeDetailsQuery(id);
  const { data: drawData, isLoading } = useDrawQuery(address?.toLowerCase(), id, disputeData?.dispute?.currentRound.id);
  const roundId = disputeData?.dispute?.currentRoundIndex;
  const voteId = drawData?.draws?.[0]?.voteIDNum;
  const { data: hasVoted } = useDisputeKitClassicIsVoteActive({
    enabled: !isUndefined(roundId) && !isUndefined(voteId),
    args: [BigInt(id ?? 0), roundId, voteId],
    watch: true,
  });

  const wasDrawn = useMemo(() => !isUndefined(drawData) && drawData.draws.length > 0, [drawData]);
  const isHiddenVotes = useMemo(() => disputeData?.dispute?.court.hiddenVotes, [disputeData]);
  const isCommitPeriod = useMemo(() => disputeData?.dispute?.period === "commit", [disputeData]);
  const isVotingPeriod = useMemo(() => disputeData?.dispute?.period === "vote", [disputeData]);

  const commited = useMemo(() => !isUndefined(drawData) && drawData?.draws?.[0]?.vote?.commited, [drawData]);
  const commit = useMemo(() => drawData?.draws?.[0]?.vote?.commit, [drawData]);
  return (
    <VotingContext.Provider
      value={useMemo(
        () => ({
          wasDrawn,
          hasVoted,
          isLoading,
          isHiddenVotes,
          isCommitPeriod,
          isVotingPeriod,
          commited,
          commit,
        }),
        [wasDrawn, hasVoted, isLoading, isHiddenVotes, isCommitPeriod, isVotingPeriod, commit, commited]
      )}
    >
      {children}
    </VotingContext.Provider>
  );
};

export const useVotingContext = () => useContext(VotingContext);
