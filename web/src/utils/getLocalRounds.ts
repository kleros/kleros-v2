interface DisputeKitDispute<T> {
  localRounds: T[];
}

/**
 * @param disputeKitDisputes an array of dispute kit disputes with field localRounds
 * @returns a flattened array of localRounds
 */
export const getLocalRounds = <T>(disputeKitDisputes: DisputeKitDispute<T>[] | undefined | null): T[] => {
  if (!disputeKitDisputes) return [];
  return disputeKitDisputes.flatMap(({ localRounds }) => localRounds);
};
