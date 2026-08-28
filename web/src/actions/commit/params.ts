import { DisputeKits } from "src/dispute-kits/disputeKits";

interface BaseCommitParams {
  disputeId: bigint;
  voteIds: bigint[];
  choice: bigint;
  salt: bigint;
  roundIndex: number;
  disputeKitId: DisputeKits;
}

export interface ClassicCommitParams extends BaseCommitParams {
  disputeKitId: DisputeKits.Classic;
}

export interface ShutterCommitParams extends BaseCommitParams {
  disputeKitId: DisputeKits.Shutter;
  decryptionDelay: number;
  justification: string;
}

export interface GatedCommitParams extends BaseCommitParams {
  disputeKitId: DisputeKits.Gated;
}

export interface GatedShutterCommitParams extends BaseCommitParams {
  disputeKitId: DisputeKits.GatedShutter;
  decryptionDelay: number;
  justification: string;
}

export interface ArgentinaConsumerProtectionCommitParams extends BaseCommitParams {
  disputeKitId: DisputeKits.ArgentinaConsumerProtection;
}

export interface ClassicUniversityCommitParams extends BaseCommitParams {
  disputeKitId: DisputeKits.ClassicUniversity;
}

export type CommitParams =
  | ClassicCommitParams
  | ShutterCommitParams
  | GatedCommitParams
  | GatedShutterCommitParams
  | ArgentinaConsumerProtectionCommitParams
  | ClassicUniversityCommitParams;
