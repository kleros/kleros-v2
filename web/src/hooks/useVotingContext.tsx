import React, { createContext, useContext, useMemo } from "react";

import { useParams } from "react-router-dom";

import { DisputeKits, REFETCH_INTERVAL } from "consts/index";
import { useWallet } from "context/walletProviders";
import {
  useReadDisputeKitClassicIsVoteActive,
  useReadDisputeKitGatedIsVoteActive,
  useReadDisputeKitGatedShutterIsVoteActive,
  useReadDisputeKitShutterIsVoteActive,
} from "hooks/contracts/generated";
import { useDisputeDetailsQuery } from "hooks/queries/useDisputeDetailsQuery";
import { useDrawQuery } from "hooks/queries/useDrawQuery";
import { useDisputeKitAddresses } from "hooks/useDisputeKitAddresses";
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
  const { account } = useWallet();
  const { data: disputeData } = useDisputeDetailsQuery(id);
  console.log("VotingContext: Account", account);
  const { data: drawData, isLoading } = useDrawQuery(account?.toLowerCase(), id, disputeData?.dispute?.currentRound.id);
  const roundId = disputeData?.dispute?.currentRoundIndex;
  const voteId = drawData?.draws?.[0]?.voteIDNum;
  console.log("VotingContext: DrawData", drawData);

  const disputeKitAddress = disputeData?.dispute?.currentRound?.disputeKit?.address;
  const { disputeKitName } = useDisputeKitAddresses({ disputeKitAddress });

  const hookArgs = [BigInt(id ?? 0), roundId, voteId] as const;
  const isEnabled = !isUndefined(roundId) && !isUndefined(voteId);

  // Add a hook call for each DisputeKit
  const classicVoteResult = useReadDisputeKitClassicIsVoteActive({
    query: {
      enabled: isEnabled && disputeKitName === DisputeKits.Classic,
      refetchInterval: REFETCH_INTERVAL,
    },
    args: hookArgs,
  });

  const shutterVoteResult = useReadDisputeKitShutterIsVoteActive({
    query: {
      enabled: isEnabled && disputeKitName === DisputeKits.Shutter,
      refetchInterval: REFETCH_INTERVAL,
    },
    args: hookArgs,
  });

  const gatedVoteResult = useReadDisputeKitGatedIsVoteActive({
    query: {
      enabled: isEnabled && disputeKitName === DisputeKits.Gated,
      refetchInterval: REFETCH_INTERVAL,
    },
    args: hookArgs,
  });

  const gatedShutterVoteResult = useReadDisputeKitGatedShutterIsVoteActive({
    query: {
      enabled: isEnabled && disputeKitName === DisputeKits.GatedShutter,
      refetchInterval: REFETCH_INTERVAL,
    },
    args: hookArgs,
  });

  // Add a return for each DisputeKit
  const hasVoted = useMemo(() => {
    switch (disputeKitName) {
      case DisputeKits.Classic:
        return classicVoteResult.data;
      case DisputeKits.Shutter:
        return shutterVoteResult.data;
      case DisputeKits.Gated:
        return gatedVoteResult.data;
      case DisputeKits.GatedShutter:
        return gatedShutterVoteResult.data;
      default:
        return undefined;
    }
  }, [
    disputeKitName,
    classicVoteResult.data,
    shutterVoteResult.data,
    gatedVoteResult.data,
    gatedShutterVoteResult.data,
  ]);

  const wasDrawn = useMemo(() => !isUndefined(drawData) && drawData.draws.length > 0, [drawData]);
  const isHiddenVotes = useMemo(() => disputeData?.dispute?.court.hiddenVotes ?? false, [disputeData]);
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
