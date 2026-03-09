import { DisputeKits } from "src/consts";

interface BaseVoteParams {
  disputeId: bigint;
  voteIds: bigint[];
  choice: bigint;
  salt: bigint;
  justification: string;
  type: DisputeKits;
}

export interface ClassicVoteParams extends BaseVoteParams {
  type: DisputeKits.Classic;
}

export interface ShutterVoteParams extends BaseVoteParams {
  type: DisputeKits.Shutter;
}

export interface GatedVoteParams extends BaseVoteParams {
  type: DisputeKits.Gated;
}

export interface GatedShutterVoteParams extends BaseVoteParams {
  type: DisputeKits.GatedShutter;
}

export interface ArgentinaConsumerProtectionVoteParams extends BaseVoteParams {
  type: DisputeKits.ArgentinaConsumerProtection;
}

export interface ClassicUniversityVoteParams extends BaseVoteParams {
  type: DisputeKits.ClassicUniversity;
}

export type VoteParams =
  | ClassicVoteParams
  | ShutterVoteParams
  | GatedVoteParams
  | GatedShutterVoteParams
  | ArgentinaConsumerProtectionVoteParams
  | ClassicUniversityVoteParams;
