import React, { useContext, createContext, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import { useDisputeDetailsQuery } from "./queries/useDisputeDetailsQuery";
import { useDrawQuery } from "./queries/useDrawQuery";
import { useDisputeKitClassicIsVoteActive } from "./contracts/generated";
import { isUndefined } from "~src/utils";

interface IVotingContext {
  wasDrawn: boolean;
  hasVoted: boolean | undefined;
  isLoading: boolean;
}

const VotingContext = createContext<IVotingContext>({ wasDrawn: false, hasVoted: false, isLoading: false });
export const VotingContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { id } = useParams();
  const { address } = useAccount();
  const { data: disputeData } = useDisputeDetailsQuery(id);
  const { data: drawData, isLoading: isDrawDataLoading } = useDrawQuery(
    address?.toLowerCase(),
    id,
    disputeData?.dispute?.currentRound.id
  );
  const roundId = disputeData?.dispute?.currentRoundIndex;
  const voteId = drawData?.draws?.[0]?.voteIDNum;
  const { data: hasVoted } = useDisputeKitClassicIsVoteActive({
    enabled: !isUndefined(roundId) && !isUndefined(voteId),
    args: [BigInt(id ?? 0), roundId, voteId],
    watch: true,
  });

  const wasDrawn = useMemo(() => !isUndefined(drawData) && drawData.draws.length > 0, [drawData]);

  return (
    <VotingContext.Provider
      value={useMemo(
        () => ({ wasDrawn, hasVoted, isLoading: isDrawDataLoading }),
        [wasDrawn, hasVoted, isDrawDataLoading]
      )}
    >
      {children}
    </VotingContext.Provider>
  );
};

export const useVotingContext = () => useContext(VotingContext);
