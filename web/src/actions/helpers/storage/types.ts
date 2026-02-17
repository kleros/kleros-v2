export interface CommitData {
  salt: bigint;
  choice: bigint;
  justification?: string;
}

export interface StoredCommitData {
  salt: string;
  choice: string;
  justification?: string;
}
