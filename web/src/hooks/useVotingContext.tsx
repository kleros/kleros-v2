import React, { useContext, createContext, useMemo } from "react";

import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";

import { REFETCH_INTERVAL } from "consts/index";
import { useReadDisputeKitClassicIsVoteActive } from "hooks/contracts/generated";
import { useDisputeDetailsQuery } from "hooks/queries/useDisputeDetailsQuery";
import { useDrawQuery } from "hooks/queries/useDrawQuery";
import { isUndefined } from "utils/index";

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
  const { data: hasVotedClassic } = useReadDisputeKitClassicIsVoteActive({
    query: {
      enabled: !isUndefined(roundId) && !isUndefined(voteId),
      refetchInterval: REFETCH_INTERVAL,
    },
    args: [BigInt(id ?? 0), roundId, voteId],
  });

  const wasDrawn = useMemo(() => !isUndefined(drawData) && drawData.draws.length > 0, [drawData]);
  const isHiddenVotes = useMemo(() => disputeData?.dispute?.court.hiddenVotes ?? false, [disputeData]);
  const isCommitPeriod = useMemo(() => disputeData?.dispute?.period === "commit", [disputeData]);
  const isVotingPeriod = useMemo(() => disputeData?.dispute?.period === "vote", [disputeData]);

  const commited = useMemo(() => !isUndefined(drawData) && drawData?.draws?.[0]?.vote?.commited, [drawData]);
  const commit = useMemo(() => drawData?.draws?.[0]?.vote?.commit, [drawData]);

  const hasVoted = useMemo(() => {
    if (isHiddenVotes && isCommitPeriod) {
      return commited;
    }
    return hasVotedClassic;
  }, [isHiddenVotes, isCommitPeriod, commited, hasVotedClassic]);

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
