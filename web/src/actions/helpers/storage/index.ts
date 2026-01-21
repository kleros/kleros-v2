import { CommitData, StoredCommitData } from "./types";

// TODO: we might need to make it throwable in future in case of choices that cannot be brute forced
export function storeCommitData(key: string, data: CommitData): void {
  const parsedData: StoredCommitData = {
    salt: data.salt.toString(),
    choice: data.choice.toString(),
    justification: data.justification,
  };

  try {
    localStorage.setItem(key, JSON.stringify(parsedData));
  } catch (err) {
    console.warn(`Failed to persist commit data for key "${key}"`, err);
  }
}

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
  } catch {
    return undefined;
  }
}

export function removeCommitData(key: string): void {
  localStorage.removeItem(key);
}
