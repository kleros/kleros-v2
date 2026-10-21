export const MIN_VOTE_JUSTIFICATION_LENGTH = 100;

export function getMissingJustificationCharacters(justification: string) {
  return Math.max(0, MIN_VOTE_JUSTIFICATION_LENGTH - justification.trim().length);
}

export function isVoteJustificationSufficient(justification: string) {
  return getMissingJustificationCharacters(justification) === 0;
}
