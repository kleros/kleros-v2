import React, { useContext, createContext, useMemo } from "react";

import { useParams } from "react-router-dom";
import { useAccount, useReadContract } from "wagmi";

import { REFETCH_INTERVAL } from "consts/index";
import { disputeKitClassicAbi } from "hooks/contracts/generated";
import { useDisputeDetailsQuery } from "hooks/queries/useDisputeDetailsQuery";
import { useDrawQuery } from "hooks/queries/useDrawQuery";
import { Bytes32Hash } from "utils/crypto/hashVote";
import { isUndefined } from "utils/index";

import { useDisputeKitInfo } from "./useDisputeKitInfo";

interface IVotingContext {
  wasDrawn: boolean;
  hasVoted: boolean | undefined;
  isLoading: boolean;
  isHiddenVotes: boolean;
  isCommitPeriod: boolean;
  isVotingPeriod: boolean;
  commited?: boolean;
  commit?: Bytes32Hash;
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

  const disputeKitAddress = disputeData?.dispute?.currentRound?.disputeKit?.address ?? undefined;
  const disputeKitInfo = useDisputeKitInfo({ disputeKitAddress });

  const canReadVoteStatus =
    !isUndefined(disputeKitInfo) &&
    !isUndefined(disputeKitAddress) &&
    !isUndefined(roundId) &&
    !isUndefined(voteId) &&
    !isUndefined(id);

  const voteResult = useReadContract({
    address: disputeKitAddress,
    abi: disputeKitInfo?.disputeKitAbi ?? disputeKitClassicAbi,
    functionName: "isVoteActive",
    args: [BigInt(id ?? 0), BigInt(roundId ?? 0), BigInt(voteId ?? 0)],
    query: {
      enabled: canReadVoteStatus,
      refetchInterval: REFETCH_INTERVAL,
    },
  });

  const hasVoted = voteResult.data;

  const wasDrawn = useMemo(() => !isUndefined(drawData) && drawData.draws.length > 0, [drawData]);
  const isHiddenVotes = useMemo(() => disputeData?.dispute?.currentRound.hiddenVotes ?? false, [disputeData]);
  const isCommitPeriod = useMemo(() => disputeData?.dispute?.period === "commit", [disputeData]);
  const isVotingPeriod = useMemo(() => disputeData?.dispute?.period === "vote", [disputeData]);

  const commited = useMemo(() => !isUndefined(drawData) && drawData?.draws?.[0]?.vote?.commited, [drawData]);
  const commit = useMemo(() => drawData?.draws?.[0]?.vote?.commit ?? undefined, [drawData]);
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
