import { DisputeKits } from "src/consts";

interface BaseCommitParams {
  disputeId: bigint;
  voteIds: bigint[];
  choice: bigint;
  salt: bigint;
  roundIndex: number;
  type: DisputeKits;
}

export interface ClassicCommitParams extends BaseCommitParams {
  type: DisputeKits.Classic;
}

export interface ShutterCommitParams extends BaseCommitParams {
  type: DisputeKits.Shutter;
  decryptionDelay: number;
  justification: string;
}

export interface GatedCommitParams extends BaseCommitParams {
  type: DisputeKits.Gated;
}

export interface GatedShutterCommitParams extends BaseCommitParams {
  type: DisputeKits.GatedShutter;
  decryptionDelay: number;
  justification: string;
}

export type CommitParams = ClassicCommitParams | ShutterCommitParams | GatedCommitParams | GatedShutterCommitParams;
