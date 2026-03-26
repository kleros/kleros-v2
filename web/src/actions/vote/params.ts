import { DisputeKits } from "src/dispute-kits";

interface BaseVoteParams {
  disputeId: bigint;
  voteIds: bigint[];
  choice: bigint;
  salt: bigint;
  justification: string;
  disputeKitId: DisputeKits;
}

export interface ClassicVoteParams extends BaseVoteParams {
  disputeKitId: DisputeKits.Classic;
}

export interface ShutterVoteParams extends BaseVoteParams {
  disputeKitId: DisputeKits.Shutter;
}

export interface GatedVoteParams extends BaseVoteParams {
  disputeKitId: DisputeKits.Gated;
}

export interface GatedShutterVoteParams extends BaseVoteParams {
  disputeKitId: DisputeKits.GatedShutter;
}

export interface ArgentinaConsumerProtectionVoteParams extends BaseVoteParams {
  disputeKitId: DisputeKits.ArgentinaConsumerProtection;
}

export interface ClassicUniversityVoteParams extends BaseVoteParams {
  disputeKitId: DisputeKits.ClassicUniversity;
}

export type VoteParams =
  | ClassicVoteParams
  | ShutterVoteParams
  | GatedVoteParams
  | GatedShutterVoteParams
  | ArgentinaConsumerProtectionVoteParams
  | ClassicUniversityVoteParams;
