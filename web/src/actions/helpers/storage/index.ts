import { CommitData, StoredCommitData } from "./types";

export function storeCommitData(key: string, data: CommitData): void {
  const parsedData: StoredCommitData = {
    salt: data.salt.toString(),
    choice: data.choice.toString(),
    justification: data.justification,
  };

  localStorage.setItem(key, JSON.stringify(parsedData));
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
