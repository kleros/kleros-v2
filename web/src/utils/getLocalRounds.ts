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

interface IndexedDisputeKitDispute<T> extends DisputeKitDispute<T> {
  id: string;
  currentLocalRoundIndex: string;
  timestamp: string;
}

/**
 * @param disputeKitDisputes dispute kit disputes with fields id, currentLocalRoundIndex, timestamp and localRounds
 * @returns the current round of the latest dispute kit dispute, matched by id because the subgraph sorts lists by id
 * as text ("1-318-10" before "1-318-9")
 */
export const findCurrentLocalRound = <T extends { id: string }>(
  disputeKitDisputes: IndexedDisputeKitDispute<T>[] | undefined | null
): T | undefined => {
  const latest = disputeKitDisputes?.reduce<IndexedDisputeKitDispute<T> | undefined>(
    (current, disputeKitDispute) =>
      current && BigInt(current.timestamp) > BigInt(disputeKitDispute.timestamp) ? current : disputeKitDispute,
    undefined
  );
  return latest?.localRounds.find(({ id }) => id === `${latest.id}-${latest.currentLocalRoundIndex}`);
};
