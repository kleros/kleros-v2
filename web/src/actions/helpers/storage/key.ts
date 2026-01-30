/**
 * @module getVoteKey
 * @description Returns a unique dispute key.
 * @returns {string} Unique dispute specific key.
 */
export const getVoteKey = (disputeId: bigint, roundIndex: number, voteIds: bigint[]) => {
  return `dispute-${disputeId}-round-${roundIndex}-voteids-${voteIds}`;
};
