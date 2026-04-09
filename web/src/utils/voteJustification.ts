export const MIN_VOTE_JUSTIFICATION_LENGTH = 100;

export function isVoteJustificationSufficient(justification: string) {
  return justification.trim().length >= MIN_VOTE_JUSTIFICATION_LENGTH;
}
