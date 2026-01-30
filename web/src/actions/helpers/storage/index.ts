import { CommitData, StoredCommitData } from "./types";

/**
 * Stores commit data to localStorage.
 * Is allowed to fail, since we can bruteforce the choice at reveal time
 *
 * @param key Unique identifier to store the data with.
 * See {@link module:getVoteKey} for details on key construction.
 * @param data Commit data to persist
 *
 * @remarks Never throws. Failures are logged as warnings.
 * @todo Make this throwable for commit types where brute-forcing is not possible.
 */
export function storeCommitData(key: string, data: CommitData): void {
  const parsedData: StoredCommitData = {
    salt: data.salt.toString(),
    choice: data.choice.toString(),
    justification: data.justification,
  };

  try {
    localStorage.setItem(key, JSON.stringify(parsedData));
  } catch (err) {
    console.warn(`storeCommitData: Failed to persist commit data for key "${key}"`, err);
  }
}

/**
 * Retrieves commit data from localStorage.
 * Is allowed to fail, since we can bruteforce the choice
 *
 * @param key Unique identifier that the data was stored with.
 * See {@link module:getVoteKey} for details on key construction.
 *
 * @remarks Never throws. Failures are logged as warnings.
 * @todo Make this throwable for commit types where brute-forcing is not possible.
 */
export function restoreCommitData(key: string): CommitData | undefined {
  const raw = localStorage.getItem(key);
  if (!raw) return undefined;

  try {
    const storedData = JSON.parse(raw) as StoredCommitData;

    return {
      salt: BigInt(storedData.salt),
      choice: BigInt(storedData.choice),
      justification: storedData.justification,
    };
  } catch (err) {
    if (err instanceof Error) {
      console.warn("restoreCommitData: Failed to retrieve choice data from localStorage.", err.message);
    }

    return undefined;
  }
}

export function removeCommitData(key: string): void {
  localStorage.removeItem(key);
}
