export const getVoteKey = (disputeId: bigint, roundIndex: number, voteIds: bigint[]) => {
  return `dispute-${disputeId}-round-${roundIndex}-voteids-${voteIds}`;
};
