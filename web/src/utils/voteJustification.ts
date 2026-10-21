// Lower than master's 100: the university court is used in workshops to demo the mechanism.
export const MIN_VOTE_JUSTIFICATION_LENGTH = 20;

export function getMissingJustificationCharacters(justification: string) {
  return Math.max(0, MIN_VOTE_JUSTIFICATION_LENGTH - justification.trim().length);
}

export function isVoteJustificationSufficient(justification: string) {
  return getMissingJustificationCharacters(justification) === 0;
}
