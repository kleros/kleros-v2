import { Account, Hex } from "viem";

import { Answer } from "@kleros/kleros-sdk";

import { DistributiveOmit, PartialBy } from "utils/types";

import { DisputeKits } from "src/consts";

interface BaseRevealParams {
  disputeId: bigint;
  voteIds: bigint[];
  choice: bigint;
  salt: bigint;
  roundIndex: number;
  justification: string;
  type: DisputeKits;
}

export interface ClassicRevealParams extends BaseRevealParams {
  type: DisputeKits.Classic;
}

export interface ShutterRevealParams extends BaseRevealParams {
  type: DisputeKits.Shutter;
}

export interface GatedRevealParams extends BaseRevealParams {
  type: DisputeKits.Gated;
}

export interface GatedShutterRevealParams extends BaseRevealParams {
  type: DisputeKits.GatedShutter;
}

export type RevealParams = ClassicRevealParams | ShutterRevealParams | GatedRevealParams | GatedShutterRevealParams;

export type ResolveRevealParams = DistributiveOmit<PartialBy<RevealParams, "justification">, "choice" | "salt">;
export type ResolveRevealContext = {
  commit?: Hex;
  answers?: Answer[];
  // required in case signing account is not available in storage
  signingAccount?: Account;
  generateSigningAccount?: () => Promise<Account | undefined> | undefined;
};
