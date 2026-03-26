import { Account, Hex } from "viem";

import { Answer } from "@kleros/kleros-sdk";

import { DistributiveOmit, PartialBy } from "utils/types";

import { DisputeKits } from "src/dispute-kits";

interface BaseRevealParams {
  disputeId: bigint;
  voteIds: bigint[];
  choice: bigint;
  salt: bigint;
  roundIndex: number;
  justification: string;
  disputeKitId: DisputeKits;
}

export interface ClassicRevealParams extends BaseRevealParams {
  disputeKitId: DisputeKits.Classic;
}

export interface ShutterRevealParams extends BaseRevealParams {
  disputeKitId: DisputeKits.Shutter;
}

export interface GatedRevealParams extends BaseRevealParams {
  disputeKitId: DisputeKits.Gated;
}

export interface GatedShutterRevealParams extends BaseRevealParams {
  disputeKitId: DisputeKits.GatedShutter;
}

export interface ArgentinaConsumerProtectionRevealParams extends BaseRevealParams {
  disputeKitId: DisputeKits.ArgentinaConsumerProtection;
}

export interface ClassicUniversityRevealParams extends BaseRevealParams {
  disputeKitId: DisputeKits.ClassicUniversity;
}

export type RevealParams =
  | ClassicRevealParams
  | ShutterRevealParams
  | GatedRevealParams
  | GatedShutterRevealParams
  | ArgentinaConsumerProtectionRevealParams
  | ClassicUniversityRevealParams;

export type ResolveRevealParams = DistributiveOmit<PartialBy<RevealParams, "justification">, "choice" | "salt">;
export type ResolveRevealContext = {
  commit?: Hex;
  answers?: Answer[];
  // required in case signing account is not available in storage
  signingAccount?: Account;
  generateSigningAccount?: () => Promise<Account | undefined> | undefined;
};
