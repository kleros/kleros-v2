const REFUSE_TO_ARBITRATE_RULING = "0";

// Rounds start tied, so a round nobody voted in is not a tied vote.
export const isTiedVote = (tied?: boolean, totalVoted?: string | number) => !!tied && Number(totalVoted) > 0;

/** A tied round rules refuse to arbitrate, as in DisputeKitClassic.currentRuling. */
export const getRuling = <T extends string | undefined>(winningChoice: T, tied?: boolean, totalVoted?: string) => ({
  ruling: tied ? REFUSE_TO_ARBITRATE_RULING : winningChoice,
  isTiedVote: isTiedVote(tied, totalVoted),
});
